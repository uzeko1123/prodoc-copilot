# 任务评审工作流后端设计（prodoc-copilot）

> 状态：设计稿，待评审。本文档不对应任何已实现的代码。
> 范围：仅后端数据模型与 API 设计。前端对接、AI 提示词工程另行设计。

## 0. 背景与现状

后端（Django 5.2 + DRF 3.16 + PostgreSQL + Redis + Channels + Celery + SeaweedFS/S3，JWT Cookie 认证）目前**零自定义模型**——`apps.main` 是空脚手架（仅 DRF 生成的 users/groups 视图集）。前端的任务/文档/评论全部在 localStorage / mock 中：

| 实体 | 前端现状 | 说明 |
|---|---|---|
| Task | `{id: uuid, name, createdAt, updatedAt}` | localStorage（dashboard，仅前端） |
| 文档内容 | Plate/Slate JSON 节点树（`Value`） | fixture → localStorage |
| Discussion（评论线程） | `{id, comments[], createdAt, isResolved, userId, documentContent?}` | `documentContent` = 锚定文本纯文本快照 |
| Comment | `{id, contentRich: Plate Value, createdAt, discussionId, isEdited, userId, createdByAI?}` | |

评论锚定机制：Plate 在文档 JSON 的文本节点上写入 `comment_<discussionId>: true` 标记（inline mark），而非 range/path。这意味着**评论 id 必须先在客户端生成**、且 mark 会**分裂文本节点**——这两点是后文多个设计决策的根源。

## 1. 总体设计决策

| 问题 | 决策 | 理由 |
|---|---|---|
| 模型归属 | 全部放 `apps.main` | Task→Document→Discussion→Comment 是同一聚合，权限统一沿成员关系过滤；拆 app 无收益 |
| 主键/ID | 数据库代理主键（BigAutoField）+ `key UUID`（客户端生成，`(document, key)` 唯一） | 派发评审副本需克隆种子讨论且保持同一 key；UUID 全局唯一性让位于"同 key 多文档"的溯源需求 |
| JSON 字段命名 | snake_case | 与现有 API（`first_name` 等）一致，orval 生成类型自动跟随 |
| 文档内容存储 | PostgreSQL JSONB（非 S3 对象） | KB 级 Plate JSON，与评论写入同事务；媒体文件继续走 `/api/upload/` → S3，URL 嵌在 JSON 内 |
| 团队角色 | `TaskMembership(team, is_admin)`，expert 即 review 团队普通成员 | 无需三态角色；单管理员用部分唯一索引保证 |
| 版本策略 | 两层：可变 `draft` + 不可变 `DocumentVersion` 快照 | 自动保存只更新 draft；显式动作（手动存版/提交/回退/定稿）才落快照，避免存储膨胀 |
| 成员加入 | 管理员直接添加已有用户 | 用户池内部、认证体系完备，令牌邀请另行扩展 |
| 写作协作 | 本期无协作：编辑团队仅管理员可写，其他成员只读 | 权限并入矩阵即可，无需锁/CRDT；扩展路线见 §8 |
| 阶段流转 API | `POST /tasks/{id}/submit/` 等 action 端点，`stage` 永不可 PATCH | 流转有前置条件、副作用、角色规则，action 与流转表一一对应 |
| 对象权限 | queryset 属主/成员过滤 + permission class 派生 | 不用 guardian——权限完全可从成员关系推导，guardian 会引入需同步的第二套权限存储 |

## 2. 阶段状态机

### 2.1 阶段

```
Task.stage ∈ { editing, review, revision, final }
```

- **editing**（编辑）：从零写作。文档编辑模式，仅编辑团队可见。任务创建者即编辑团队管理员（可转让），管理员可拉人。
- **review**（评审）：文档阅读模式，仅评审团队可见。评审管理员（提交时由编辑管理员指定，可转让）可拉人（评审成员=专家）。**评审与复审是同一阶段的多次循环**——`round_number` 记录已完成轮数，首轮也可直接 `approve` 进入 final。
- **revision**（修订）：编辑团队根据汇总意见修订文档并逐条回复。
- **final**（定稿）：终态。定稿版本 + 意见 + 回复归档，全员只读。

### 2.2 流转表（唯一权威，`Task.transition()` 在 `select_for_update` + 事务内执行）

| # | 起点 | 动作 | 终点 | 允许角色 | 前置条件 | 同事务副作用 |
|---|---|---|---|---|---|---|
| T1 | editing | `submit` | review | 编辑管理员 | working 文档无未解决 discussion（查库）；无未处理修订建议（客户端断言 + 服务端 best-effort 扫 `suggestion_*` mark）；请求携带 `review_admin_id` | 快照 draft → `DocumentVersion(trigger=submit)`；创建 `ReviewRound(round_no=1)` + review_master 副本（内容=快照）；创建评审团队（指定者为管理员）；Celery 排队 AI 形式审查；round → `ai_pending` |
| T2 | review | `send_back` | revision | 评审管理员 | 当前轮已 `aggregated`（汇总完成） | （汇总动作本身已把意见物化到 working 文档，见 §5.3） |
| T3 | revision | `resubmit` | review | 编辑管理员 | 最近一轮全部汇总意见 `writer_status != pending` 且各有 ≥1 条编辑团队回复 | 快照 → submit 版本；创建 `ReviewRound(round_no=n+1)` + 新 review_master；Celery 排队 AI 复审（输入=修订稿 + 意见 + 回复）；round → `ai_pending` |
| T4 | review | `approve` | final | 评审管理员 | 任意轮次（含首轮）：AI/专家意见已阅即可 | 定稿快照 `DocumentVersion(trigger=system, label="定稿")`；任务全部文档只读归档 |
| — | 任意非 final | `transfer_admin` | （不变） | 当前团队管理员 | 目标为同团队在册成员 | 角色互换（is_admin 翻转），单管理员索引兜底并发 |
| — | 任意非 final | 增/删成员 | （不变） | 团队管理员 | 评审阶段进行中不删未提交的评审成员；不可移除/降级最后一名管理员 | TaskEvent 记录 |

注：首轮 AI 任务为"形式审查"，后续轮次为"复审确认"，差异仅在提示词（`round_no > 1` 判断），机制完全相同，故 ReviewRound 不设 kind 字段。

### 2.3 审计与事件

```python
class TaskEvent(models.Model):
    task = FK(Task, related_name="events")
    actor = FK(User, null=True)        # null = 系统/AI
    type = CharField                   # stage_transition / member_added / aggregated / ai_opinions_ready / ...
    from_stage = CharField(null=True)
    to_stage = CharField(null=True)
    data = JSONField(default=dict)     # 如 {"round": 2, "reviewer": ...}
    created_at = DateTimeField(auto_now_add=True)
```

兼任 UI 时间线数据源与 WS 广播源（`group_send("task-{id}", ...)`）。选自研而非 django-simple-history：需要的是领域事件流，不是行级 diff。

## 3. 团队与成员

```python
class TaskMembership(models.Model):
    task = FK(Task, related_name="memberships")
    user = FK(User, related_name="task_memberships")
    team = CharField(choices=["editing", "review"])
    is_admin = BooleanField(default=False)
    added_by = FK(User, null=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=("task", "user", "team"), name="uniq_membership"),
            # 每团队恰有一名管理员（数据库级保证，并发安全）
            UniqueConstraint(fields=("task", "team"), condition=Q(is_admin=True),
                             name="uniq_admin_per_team"),
        ]
```

- **expert 即 review 团队 `is_admin=False` 的成员**，无独立角色。
- **允许同一用户同时属于两个团队**（如小任务一人分饰两角）。
- 任务创建时播种创建者为 editing 团队管理员；T1 时播种 `review_admin_id` 为 review 团队管理员。
- 管理员转让 = 一个事务内 is_admin 互换，部分唯一索引杜绝"零管理员/双管理员"窗口。
- API：`GET/POST /tasks/{id}/members/`（管理员，`{user_id, team}`，普通成员默认 is_admin=False）、`DELETE /tasks/{id}/members/{uid}/?team=`、`POST /tasks/{id}/members/{uid}/transfer-admin/?team=`。

## 4. 文档与版本系统

### 4.1 模型

```python
class Document(models.Model):
    class Kind(models.TextChoices):
        WORKING = "working"            # 编辑团队的工作文档（每任务 1 份，本期）
        REVIEW_MASTER = "review_master"  # 每轮评审的主副本，承载 AI + 管理员意见
        REVIEW_COPY = "review_copy"    # 每轮每位评审成员一份，承载其独立意见

    task = FK(Task, related_name="documents")
    kind = CharField(choices=Kind)
    round = FK("ReviewRound", null=True, related_name="documents")  # master/copy 所属轮
    copy_of = FK("self", null=True, related_name="copies")          # review_copy -> review_master
    owner = FK(User, null=True)   # review_copy -> 对应评审成员；working -> 编辑管理员；
                                  # review_master -> 评审管理员（转让管理员时同步更新）
    title = CharField(max_length=255, blank=True, default="")
    draft = JSONField(default=list)              # 可变实时内容（仅 working 使用）
    current_version = FK("DocumentVersion", null=True, related_name="+")  # 当前快照指针
    version_seq = PositiveIntegerField(default=0)  # 单调递增，select_for_update 下自增
    created_at / updated_at
```

```python
class DocumentVersion(models.Model):
    document = FK(Document, related_name="versions")
    number = PositiveIntegerField()          # 每文档 1..n
    content = JSONField()                    # 插入后不可变（无任何 UPDATE 路径）
    trigger = CharField(choices=["manual", "submit", "rollback", "system"])
    source_version = FK("self", null=True)   # 回退时指向被恢复的旧版本
    label = CharField(blank=True, default="")  # 如 "定稿"
    created_by = FK(User, null=True)
    created_at = DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [UniqueConstraint(fields=("document", "number"), name="uniq_version_no")]
```

### 4.2 读写规则

- **读**（单一权威端点 `GET /documents/{id}/content/`）：`kind=working 且 stage ∈ {editing, revision}` 返回 `draft`；其余一律返回 `current_version.content`。
- **写**（`PUT /documents/{id}/content/`，自动保存）：仅 `kind=working 且 stage ∈ {editing, revision} 且 user 是 editing 团队管理员`；请求携带读取时的 `updated_at` 做乐观锁兜底（不匹配 → 409 + 当前内容），防管理员自己多端冲突。
- **手动存版**：`POST /documents/{id}/versions/` → draft 快照为 `trigger=manual` 版本。
- **回退**：`POST /documents/{id}/rollback/ {to_version}` → 用旧版本**内容**创建**新**版本（`trigger=rollback, source_version` 指向来源），`current_version` 指向它，draft 同步刷新。历史永不修改、永不删除。
- 评审阶段文档内容只读不加锁字段——只读由 `(kind, stage)` 派生（见 §6），stage 即唯一事实。

## 5. 评审轮次与意见汇总（核心）

### 5.1 模型

```python
class ReviewRound(models.Model):
    task = FK(Task, related_name="rounds")
    round_no = PositiveIntegerField()
    status = CharField(choices=[
        "ai_pending",     # Celery 生成 AI 意见中
        "admin_review",   # 管理员检查/调整 AI 意见
        "reviewing",      # 已派发，评审成员独立评审中
        "aggregated",     # 管理员已汇总（可 send_back）
        "completed",      # 该轮结束（已打回或已批准）
    ])
    base_version = FK(DocumentVersion)   # 本轮评审针对的冻结快照
    master = FK(Document, related_name="+")  # 冗余指针，指向本轮 review_master
    ai_report = JSONField(default=dict)  # AI 原始输出（审计用）
    created_at / submitted_at / aggregated_at / completed_at

    class Meta:
        constraints = [UniqueConstraint(fields=("task", "round_no"), name="uniq_round_no")]


class ReviewSubmission(models.Model):
    round = FK(ReviewRound, related_name="submissions")
    reviewer = FK(User)
    document = FK(Document)              # 该评审成员的 review_copy
    status = CharField(choices=["in_progress", "submitted"])
    submitted_at = DateTimeField(null=True)

    class Meta:
        constraints = [UniqueConstraint(fields=("round", "reviewer"), name="uniq_submission")]
```

### 5.2 Discussion / Comment

```python
class Discussion(models.Model):
    # 代理主键 + 客户端 key：克隆评审副本时种子讨论需跨文档保持同一 key
    key = UUIDField()                            # Plate mark `comment_<key>` 引用
    document = FK(Document, related_name="discussions")
    round = FK(ReviewRound, null=True)           # 评审轮产生的意见；null = 编辑期评论
    user = FK(User)                              # 创建者
    document_content = TextField(blank=True, default="")  # 锚定文本纯文本快照（前端已有）
    anchor = JSONField(default=dict)             # {blockPath: [...], offset, length}（相对 base_version）
    origin = CharField(choices=["human", "ai", "aggregated"], default="human")
    source_discussion = FK("self", null=True)    # 溯源：汇总意见 -> 评审期原意见
    source_reviewer = FK(User, null=True)        # 溯源：意见出自哪位评审成员
    is_resolved = BooleanField(default=False)    # 前端已有概念（编辑器侧解决）
    review_verdict = CharField(null=True, choices=["agree", "reject"])  # 评审成员对管理员意见的裁决（仅 review_copy 上）
    writer_status = CharField(default="pending", choices=["pending", "addressed", "rejected"])  # 修订期逐条回复状态

    class Meta:
        constraints = [UniqueConstraint(fields=("document", "key"), name="uniq_discussion_key")]
        ordering = ("created_at",)


class Comment(models.Model):
    key = UUIDField()
    discussion = FK(Discussion, related_name="comments")
    user = FK(User, null=True)          # null = AI
    content_rich = JSONField()          # Plate Value
    created_by_ai = BooleanField(default=False)   # 对齐前端 createdByAI
    is_edited = BooleanField(default=False)       # 编辑即置 True

    class Meta:
        constraints = [UniqueConstraint(fields=("discussion", "key"), name="uniq_comment_key")]
        ordering = ("created_at",)
```

**为什么 key 不做主键**：派发时把 review_master 的 content（含 mark）与种子 Discussion **克隆**给每位评审成员，且必须**保持同一 key**——克隆出的 Plate value 里的 mark 引用它，汇总时也按 key 对齐"评审成员对管理员意见 X 的裁决"。同一 key 存在于 N 个文档，唯一性只能落在 `(document, key)`，主键让位给代理键。

### 5.3 评审全流程（含汇总冲突分析）

**① AI 形式审查（T1/T3 后，Celery）**
AI 在本轮 review_master 上产出一组意见：每条 = 一个 `origin="ai"` 的 Discussion（`document_content` + `anchor` 锚定）+ 一条 `user=null, created_by_ai=True` 的 Comment。完成后 round → `admin_review`，WS 通知。

锚定实现：后端需一个 `plate_text.py` 工具——递归遍历 Plate JSON 提取纯文本 + 块路径（约 30 行），把 AI 引文的定位转换为 `{blockPath, offset, length}`。这是后端唯一需要理解 Plate 结构的地方（同时服务 §2.2 的 suggestion 扫描）。

**② 管理员检查/调整（admin_review）**
管理员对 AI 意见走常规编辑路径：改 Comment 内容、resolve/删除 Discussion、自行新增 Discussion。之后二选一：
- **直接打回**（认为问题明显无需专家）：先执行汇总（仅 AI+管理员意见），再 `send_back`（T2）；
- **派发给专家**：`POST /rounds/{rid}/dispatch/ {reviewer_ids[]}`——克隆 master content + 种子 Discussion（同 key）→ 每位评审成员一份 review_copy + 一条 ReviewSubmission；round → `reviewing`。

**③ 专家独立评审（reviewing）**
- 每位评审成员只见 review_master（读）+ 自己的 review_copy。
- 在自己副本上：对**种子意见**（管理员调整后的 AI/管理员意见）置 `review_verdict=agree/reject` 并可在其下 Comment 讨论（=「拒绝或更多意见」）；**新增**自己的意见（新 Discussion，客户端新 UUID）。
- **意见相互不可见是结构性的**：各评审成员的意见分属不同 Document，靠文档级可见性隔离即天然成立，无需 WHERE 子句承诺，无 key 冲突（新意见 UUID 全局唯一，种子意见同 key 属刻意克隆）。
- 完成后 `POST /rounds/{rid}/submissions/{sid}/submit/`，其副本讨论锁定不可再改。

**④ 管理员汇总（aggregate）——策展行为，非盲目并集**

汇总冲突分析结论（关键研究问题的回答）：

1. **key 冲突**：按构造不存在（上述）。
2. **绝不在服务端逐节点合并 Plate value**。mark 会使文本节点在标记边界处**分裂**：评审成员 A 的副本在 offset 12 处分裂、B 在 offset 30 处，两副本节点数组结构性分叉——尽管串联文本完全相同。朴素的结构合并（zip 节点、并集 marks）是**错误的**，不只是别扭。**汇总的操作单位是 Discussion + anchor，永远不是 value 合并。**
3. **anchor 稳定性**：本轮所有 mark 都创建在与 `base_version` 完全相同的内容上，故 anchor 在任何副本上有效；修订恰从 base_version 出发，对 working 文档同样有效。锚仅在写作团队后续编辑后失效（一切评论系统的共性问题，`document_content` 文本快照为兜底展示）。
4. **"重复"意见**：两位评审成员标同一句 → 两条独立 Discussion（key 不同、anchor 重叠、内容相似）。数据层面无冲突；处理方式是**展示层按 anchor 重叠分组** + 管理员汇总时策展取舍，数据模型不做去重。
5. **汇总的落地语义**：`POST /rounds/{rid}/aggregate/ {items: [{source_discussion_id, include: bool}]}`（单事务）：
   - 对每条选中的意见 D（来自 master 或某 review_copy）：在 **working 文档**上新建 Discussion，**复用 D 的 key**（working 文档尚无这些 key，安全；且客户端按 anchor 补 mark 时 id 跨请求稳定）、`origin="aggregated"`、`source_discussion=D`、`source_reviewer=D.user`，复制 `document_content` + `anchor` + 首条 Comment 内容。
   - round → `aggregated`。
   - **写作团队如何在自己的文档里看到**：`GET /rounds/{rid}/aggregated-opinions/` 返回 `[{key, anchor, document_content, comments[], source_reviewer}]`；客户端在其 draft（此刻内容仍等于 base_version）上按 anchor 应用 `comment_<key>` mark 后保存。服务端永不触碰 Plate 结构，"文档 value 中的 mark ↔ 该文档的 Discussion"不变式保持成立。

**⑤ 打回与修订**
- `send_back`（T2）→ revision。编辑团队修订（仅管理员可写），对每条汇总意见：在 working 文档的对应 Discussion 下 Comment 回复，并置 `writer_status = addressed / rejected`（rejected = 认为意见不妥并说明理由，是合法终态，不阻塞 resubmit，作为复审 AI/管理员的输入）。
- `resubmit`（T3）门槛：服务端查询最近一轮汇总意见全部 `writer_status != pending` 且各有 ≥1 条编辑团队 Comment。

**⑥ 批准**
任意轮次（含首轮）评审管理员可 `approve`（T4）→ final，产出定稿快照；归档物 = 定稿版本 + 各轮汇总意见 + 回复（均为既有表的普通查询）。

### 5.4 AI 意见的表示（非一等公民）

AI 意见复用 Discussion（`origin="ai"`）+ Comment（`created_by_ai=True, user=null`），不建独立 Opinion 模型：前端类型已携带 `createdByAI`，一等模型会与 Comment（富内容、作者、编辑标记）重复并分叉评论 UI。AI 特有的仅有两点：评论权限矩阵允许**管理员**编辑 AI Comment；生成完成翻转 round 状态并发 WS 事件。

AI 生成以接口 `generate_ai_opinions(round)` stub（返回固定/排队结果），真实 LLM 接入与提示词另行设计。

## 6. 权限与可见性矩阵

权限完全由 `(document.kind, task.stage, membership.team, membership.is_admin)` 派生，实现为 queryset 过滤（读）+ permission class（写）。他人对象一律 404（不泄露存在性）。final 阶段全员只读。

| 主体 \ 对象 | working 文档（内容） | working 文档的 discussion | review_master | 自己的 review_copy | 他人 review_copy |
|---|---|---|---|---|---|
| 编辑管理员 | editing/revision 可写；review/final 只读 | editing/revision 可写；汇总意见可回复 | 不可见 | — | 不可见 |
| 编辑成员 | 只读 | 只读 | 不可见 | — | 不可见 |
| 评审管理员 | 不可见 | 不可见 | 可写（意见） | 全部只读 | 全部只读 |
| 评审成员 | 不可见 | 不可见 | 只读 | 可写（自己的意见，提交前） | **不可见（结构性）** |
| 外人 | 全部不可见（404） | | | | |

写权限补充：
- working 内容 PUT：仅编辑管理员 + 乐观锁（§4.2）；
- discussion/comment 增改：按上表；Comment 编辑限作者本人（或评审管理员编辑 AI Comment）；Comment 更新自动置 `is_edited=True`；
- `is_resolved`：种子意见在 review_copy 上由该副本评审成员切换（即前端概念）；`review_verdict` 仅评审成员在本人副本上可置；`writer_status` 仅编辑团队在 working 文档上可置。

## 7. API 面（DRF，`/api/main/` 前缀，全部需认证；动作用 `@action` 以进入 OpenAPI/orval）

```
Tasks
  GET/POST             /tasks/                    列表按成员关系过滤；创建播种创建者为 editing 管理员 + working 文档
  GET/PATCH            /tasks/{id}/               仅 name 可 PATCH，stage 永不可
  GET                  /tasks/{id}/events/        审计时间线
  GET                  /tasks/{id}/rounds/        轮次历史
  POST                 /tasks/{id}/submit/        T1  {review_admin_id, client_asserts_clean}
  POST                 /tasks/{id}/send-back/     T2
  POST                 /tasks/{id}/resubmit/      T3
  POST                 /tasks/{id}/approve/       T4
Members
  GET/POST             /tasks/{id}/members/       {user_id, team}
  DELETE               /tasks/{id}/members/{uid}/?team=
  POST                 /tasks/{id}/members/{uid}/transfer-admin/?team=
Documents
  GET/PUT              /documents/{id}/content/   PUT=自动保存（编辑管理员 + updated_at 乐观锁）
  GET/POST             /documents/{id}/versions/  手动存版
  GET                  /documents/{id}/versions/{n}/
  POST                 /documents/{id}/rollback/  {to_version}
Rounds
  GET                  /rounds/{rid}/
  POST                 /rounds/{rid}/dispatch/            {reviewer_ids[]}
  POST                 /rounds/{rid}/submissions/{sid}/submit/
  POST                 /rounds/{rid}/aggregate/           {items:[{source_discussion_id, include}]}
  GET                  /rounds/{rid}/aggregated-opinions/  写作团队客户端叠加 mark 用
Discussions / Comments（嵌套于 document）
  GET/POST             /documents/{did}/discussions/
  GET/PATCH            /documents/{did}/discussions/{key}/   is_resolved / review_verdict / writer_status 按矩阵
  GET/POST             /documents/{did}/discussions/{key}/comments/
  PATCH                /documents/{did}/discussions/{key}/comments/{ckey}/
WebSocket（/events/main/，后续实现）
  task 组消息：stage_changed / round_status_changed / ai_opinions_ready / task_event
```

JSON 约定：snake_case；错误沿用 DRF + 全局 locale（zh-hans）。分页：暂不启用（DRF 默认），列表增大后开启无需改路由。

## 8. 写作协作与 AI 功能（本期结论）

- **本期**：无协作机制。编辑团队仅 `is_admin=True` 的管理员可编辑内容，其他成员只读——直接并入 §6 权限矩阵，无 Redis 锁/心跳/接管。
- **现有 AI 功能**：聊天/命令均操作本地编辑器状态，管理员（唯一写者）使用完全不受影响；只读成员保留"就文档提问"类只读 AI，改写类命令与人类编辑共用同一权限位。
- **后续扩展路线**（按成本递增）：
  1. 成员可写 + Redis TTL 软锁 + WS 心跳（单人编辑锁，"XX 正在编辑"提示与接管）；
  2. Yjs/CRDT 实时协同——注意届时 AI 命令必须改造为服务端集成或经客户端 provider 重基的 Yjs 事务，所有 AI 命令需针对并发重测，成本极高，单独立项。

## 9. 测试矩阵（pytest-django，APIClient 打真实 URL）

角色 fixture：编辑管理员 W1、编辑成员 W2、评审管理员 R1、评审成员 E1/E2、外人 O。参数化 stage × actor × object。

- **流转**：每个 Tn 仅指定角色可触发（他人 403、错误阶段 409）；并发 submit+invite 串行化（事务测试）；T1/T3 前置校验（存在未解决 discussion → 拒绝；`writer_status=pending` → 拒绝 resubmit）。
- **单管理员不变量**：转让不产生 0/2 管理员窗口（断言唯一约束触发）；不可移除最后管理员；同一用户可同时入两团队。
- **内容与版本**：W2 在 editing 不能 PUT draft；任何人不能 PUT master/copy；review/final 阶段 working 不可 PUT；版本内容不可变（无更新路径）；回退产生新版本（content 等值、source_version 指向来源、旧版本未动）；版本号每文档无洞。
- **评审隔离（重点）**：E1 无法列出/读取 E2 的任何 discussion（断言空集而非 403 泄露）；E2 文档对 E1 404；评审管理员可读全部副本；编辑团队在 review 阶段读不到任何评审文档；汇总后编辑团队仅见 working 上的 aggregated 意见。
- **克隆与汇总**：派发后种子 discussion 跨副本保持同 key；汇总意见落在 working、复用 key、`source_discussion/source_reviewer` 溯源正确；同 anchor 两条意见保持独立两行；round 状态机按序流转。
- **乐观锁**：携带过期 `updated_at` PUT content → 409 + 当前内容。
- **匿名**：全部端点 401/403。

## 10. 实现分期建议

1. **模型 + 迁移**：全部 9 个模型（Task/TaskEvent/TaskMembership/Document/DocumentVersion/ReviewRound/ReviewSubmission/Discussion/Comment），`Task.transition()` 状态机。删除 users/groups 脚手架视图。
2. **任务与成员端点**：CRUD、成员增删、transfer-admin、events、不变量测试。
3. **内容与版本**：content GET/PUT（权限 + 乐观锁）、手动存版、回退、`plate_text.py`。
4. **Discussion/Comment CRUD**：完整权限矩阵。
5. **轮次机制与流转动作**：submit/dispatch/submission submit/aggregate/send_back/resubmit/approve，AI 以 `generate_ai_opinions(round)` stub。
6. **WS 事件广播**（可并入 2–5 逐步加）。

每期结束跑 `pytest` + `ruff` + `mypy`；`/api/schema/` 校验后前端 `npm run api:gen`。

## 11. 遗留问题 / 明确不做

- final 任务重开（终态不可逆；业务需要再议）
- 令牌/邮件邀请（现为直接添加）
- 单任务多文档（现为每任务 1 份 working 文档）
- 真实 LLM 接入与提示词工程（现为接口 stub）
- 服务端深度理解 Plate 结构（仅 `plate_text.py` 提取文本；value 合并明确禁止）
- "提交时无修订建议"的服务端强校验（现为客户端断言 + best-effort 扫描；suggestion mark 格式钉死后收紧）
- 成员级写作协作与实时协同（§8）
- guardian 清理（保持安装不使用）与 upload 端点匿名可写问题（遗留安全隐患，建议另行修复）
