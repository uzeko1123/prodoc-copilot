<!-- 评论工具（comment）的工具描述与 Schema 字段描述：由 prompts/prompts.ts 按 “## <字段名>” 分节解析，分发至 tool-comment.ts -->
<!-- 字段名须与 tool-comment.ts 的 Schema 字段完全一致；修改描述须同步 shared/tools.md 的 2.3 章节 -->

## tool

评论工具（comment）：为文档中的一段文本附加一条评论。blockId 选定目标块，content 在该块内定位范围，comment 为评语内容（纯文本）

## blockId

目标块 ID，即 Context 文档树（children）中目标块节点的 id 属性值

## content

定位用的原文片段（纯文本，须与文档逐字一致）：在目标块的纯文本中匹配此内容以确定操作范围，先精确匹配、再模糊匹配，取首次出现的位置；多个片段之间以空行分隔时，各片段依次在目标块之后的兄弟块中匹配，共同构成一个连续范围（此时取第一段所在块的 id 作为 blockId）

## comment

评论内容（纯文本，不使用 Markdown 语法）
