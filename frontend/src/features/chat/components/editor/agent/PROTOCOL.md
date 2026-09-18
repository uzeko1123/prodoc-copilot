# AI Chat 标准协议说明（ai-sdk）

本文档说明 `agent/` 目录下请求标准化层所依赖与生成的协议格式：

- **请求**：OpenAI Chat Completions 兼容格式（`POST /api/ai/command`），附加自定义 `context` 扩展字段；
- **响应**：ai-sdk **UI message stream**（`useChat` 直接消费的 SSE 流）。

协议转换全部由 ai-sdk 原生完成：请求序列化与 OpenAI SSE 解析由 `streamText` +
`@ai-sdk/openai-compatible` 驱动，UI 流由 `streamText().toUIMessageStreamResponse()`
生成，**无手写适配器**。实现见 [agent-transport.ts](./agent-transport.ts)。

---

## 1. 端到端数据流

```
aiChat.submit (mode/toolName/chatNodes/chatSelection)
      │
      ▼
useChat sendMessage({text}, {body: {ctx: {children, selection, toolName}}})
      │
      ▼
DefaultChatTransport.fetch  ←── createAgentChatTransport 拦截（submit 完成后、发送前）
      │  1. 持久化 user message（prompt + metadata.selectionText → zustand store）
      │  2. convertToModelMessages（UIMessage → ModelMessage，过滤中断的工具调用）
      │  3. 有选区时向最后一条 user 消息追加 <Selection> 块
      │  4. streamText + openai-compatible provider：
      │       ├── 请求体注入独立 context 字段
      │       ├── ctx.toolName ∈ {comment, edit, generate} → tool_choice 强制
      │       └── 失败 → mockApiResponse（原始请求，现有假流不变）
      ▼
POST /api/ai/command        （OpenAI 兼容请求体，见 §2）
      │
      ▼
OpenAI SSE 响应             （delta.content / delta.tool_calls，见 §2.3）
      │  provider 解析 → streamText → toUIMessageStreamResponse()
      ▼
UI message stream           （SSE: `data: <json>`，见 §3）
      │
      ▼
useChat reducer             （text-* / tool-input-* chunk → message.parts）
      │
      ▼
useAgentTools               （tool part → mode + toolName，见 §4/§5）
      │
      ▼
编辑器操作                   （generate 流式插入 / edit inline suggestion / comment 标记）
```

---

## 2. 请求协议：OpenAI Chat Completions 兼容

### 2.1 字段一览

| 字段          | 来源                                        | 说明                                                                                                                        |
| ------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `model`       | `chatOptions.body.model`，默认 `'agent'`    | 模型标识                                                                                                                    |
| `messages`    | `convertToModelMessages(UIMessages)`        | 标准 OpenAI 消息数组，含历史工具调用（见 §4.4）                                                                             |
| `system`      | transport 内 `SYSTEM_PROMPT` 常量           | 智能体角色与规则（`/command` 仅为提示词等）                                                                                 |
| `tools`       | `generateTool` / `editTool` / `commentTool` | 恰 3 个工具，序列化为 `{type: 'function', function: {name, description, parameters}}`                                       |
| `tool_choice` | `ctx.toolName` 决定                         | 快捷操作强制 `{'type': 'function', 'function': {'name': <toolName>}}`；普通输入省略（OpenAI 默认 `auto`）                   |
| `stream`      | 恒 `true`                                   | 流式响应                                                                                                                    |
| `context`     | **自定义扩展字段**                          | `{children: TNode[], selection: TRange \| null}` —— 编辑器完整文档与选区，**独立于 messages，不进入任何 Message**（需求 1） |

> `context.children` 为提交时刻的 `editor.children` 快照；`context.selection` 为
> `TRange | null`（块选择时为 `null`）。后端不应将其回显进对话历史。

### 2.2 消息内容约定

- 用户 prompt 可能带 `/command` 前缀（如 `/comment`、`/improveWriting`），**仅是
  操作意图的提示词**；真正要调用的工具由 `tool_choice` 强制指定。
- 有选区时，最后一条 user 消息内容末尾追加块：
  `<Selection>…选中文字…</Selection>`（与正文之间隔两个换行）
- 第二轮起，历史中的工具调用以 assistant `tool_calls` + `role: 'tool'` 消息回填
  （由 `convertToModelMessages` 标准转换生成；工具结果即 `{success: boolean}`）。

### 2.3 期望的响应格式（OpenAI SSE）

`Content-Type: text/event-stream`，帧为 `data: <json>\n\n`（JSON 后跟空行）：

- 纯文本回复：`choices[0].delta.content` 分片 → `finish_reason: 'stop'`；
- 工具调用：`choices[0].delta.tool_calls[].function.arguments` 以 JSON 字符串分片
  流式到达 → `finish_reason: 'tool_calls'`；
- 以 `data: [DONE]` 结束。

```jsonc
// 工具调用分片示例
{
  "choices": [
    {
      "delta": {
        "tool_calls": [
          {
            "index": 0,
            "id": "call_1",
            "type": "function",
            "function": { "name": "generate", "arguments": "{\"con" },
          },
        ],
      },
      "index": 0,
    },
  ],
}
```

---

## 3. 响应协议：ai-sdk UI message stream

transport 将 OpenAI SSE 转换为 UI message stream 后返回给 `useChat`。SSE 帧同样为
`data: <json>\n\n`，`data: [DONE]` 由 SDK 自动跳过。

### 3.1 chunk 类型全表

| chunk `type`           | 载荷字段                      | 说明                                                         |
| ---------------------- | ----------------------------- | ------------------------------------------------------------ |
| `start`                | `messageId`                   | 消息开始                                                     |
| `start-step`           | —                             | 步骤开始                                                     |
| `text-start`           | `id`                          | 文本 part 开始                                               |
| `text-delta`           | `id`, **`delta`**             | 文本增量                                                     |
| `text-end`             | `id`                          | 文本 part 结束                                               |
| `tool-input-start`     | `id`(=toolCallId), `toolName` | 工具调用开始                                                 |
| `tool-input-delta`     | `id`, **`inputTextDelta`**    | 参数 JSON 字符串的增量片段（注意字段名与 `text-delta` 不同） |
| `tool-input-available` | `id`, `toolName`, `input`     | 参数流结束，完整可用                                         |
| `tool-input-error`     | `id`, `toolName`, `errorText` | 参数解析失败                                                 |
| `finish-step`          | —                             | 步骤结束                                                     |
| `finish`               | `finishReason`, `totalUsage`  | 消息结束                                                     |

### 3.2 客户端消费

`useChat` reducer 将 chunk 归并进 `message.parts`：

- `text-*` → `{type: 'text', text}` part（走原有 `useChatChunk` 路径）；
- `tool-input-*` → `{type: 'tool-<name>', toolCallId, state, input, output}` part
  （由 `useAgentTools` 消费，见 §4）。

---

## 4. 工具调用生命周期

以 `generate` 为例（`edit`/`comment` 同理）：

```
input-streaming          input-available          output-available
（参数 JSON 分片到达）  →  （参数完整）  →  客户端 apply  →  addToolOutput({success})
     │                        │                + finish         │
     │ reducer 用              │ useAgentTools  effect           │ 下一轮请求经
     │ parsePartialJson        │ setToolContext                  │ convertToModelMessages
     │ 暴露深度部分             │ ('insert','generate')           │ 变为 assistant tool_calls
     │ part.input.content      │ applyGenerateChunk              │ + role:'tool' 消息
     ▼ (可为 undefined，跳过该 tick)                              ▼
```

1. **`input-streaming`**：reducer 对已累积的参数字符串运行 `parsePartialJson`，得到
   深度部分对象（如 `{content: "Hel"}`）。前端据此**增量消费**（generate 逐段插入、
   edit 反复全量重算 suggestion）。不完整的 `\uXXXX` 转义会让该 tick 的 `part.input`
   为 `undefined`，跳过即可，下轮补齐。
2. **`input-available`**：参数完整。comment 等非幂等操作在此时**一次性**应用。
3. **`addToolOutput({tool, toolCallId, output: {success: true}})`**：finish effect 中
   调用，part 状态推进为 `output-available` —— 这也是工具结果能进入下一轮请求的
   前提（`ignoreIncompleteToolCalls: true` 会过滤掉未到达 `output-available` 的
   工具调用）。
4. **下一轮请求**：`convertToModelMessages` 将其转换为 assistant
   `tool_calls` + `role: 'tool'`（content 即 `{success: true}`）历史消息，智能体
   可据此继续。

工具定义中的参数 schema（`tool-generate.ts` / `tool-edit.ts` / `tool-comment.ts`）
即后端需要填写的内容；`{success: boolean}` 为工具返回给智能体的结果。

---

## 5. 三工具与 mode + toolName 映射

| 工具        | mode + toolName                            | 编辑器操作                                                          | 入参                          | 对应文件           |
| ----------- | ------------------------------------------ | ------------------------------------------------------------------- | ----------------------------- | ------------------ |
| `generate`  | insert + generate                          | 光标下方流式插入（AI 锚点节点 + `streamInsertChunk`，可接受/放弃）  | `{content: string}`           | `tool-generate.ts` |
| `edit`      | chat + edit                                | 选区 inline suggestion diff（`withAIBatch` + `applyAISuggestions`） | `{content: string}`           | `tool-edit.ts`     |
| `comment`   | insert + comment（与 chat + comment 合并） | `aiCommentToRange` → discussion + comment 标记                      | `{blockId, comment, content}` | `tool-comment.ts`  |
| —（无工具） | chat + generate                            | 纯文本流，走原有 `useChatChunk` text 路径                           | —                             | —                  |
| —（排除）   | insert + edit                              | 不支持，未纳入工具                                                  | —                             | —                  |

拆分逻辑在 `use-agent-tools.ts`：`setToolContext` 把工具名还原为
`AIChatPlugin` 的 `mode`/`toolName` 选项，再调用与原 `onData`/`onChunk` 相同的
apply 函数；`hasActiveToolParts` 守卫防止同一消息的文本被旧路径二次处理。

---

## 6. Store 持久化（zustand）

- **key**：`chat-storage`（localStorage，`partialize` 仅持久化 `chatMessages`）；
- **user message**：发送前由 transport 写入，`metadata.selectionText` 记录当时
  选中文本（`appendChatMessage` 按 `id` 去重，regenerate 不会重复写入）；
- **assistant message**：finish effect 写入，工具 part 已注入
  `{output: {success: true}, state: 'output-available'}`；
- **context 不入库**：`children`/`selection` 只随请求发送，不属于 Message。

---

## 7. 回退行为（无后端开发模式）

`/api/ai/command` 不可用（`!res.ok` 或无 body）时，provider fetch 先将
`mockApiResponse(editor, init, …)` 的结果存入闭包（mock 收到的是**原始未标准化**
请求，行为与旧版完全一致），再向 `streamText` 返回合成的空 OpenAI 流
（`data: [DONE]\n\n` 一帧）使其干净收尾；外层 transport 直接改返 mock 的
UI message stream。mock 的 `data-toolName` / `data-comment` / `data-table` 事件
继续走 `useChat` 的 `onData` 旧路径。
