# Plate.js hooks reference

How every platejs (v53) React hook triggers re-renders, which ones this app
uses where, and how to pick between them. React Compiler is enabled, so
render-level memoization is automatic — what the compiler cannot do is stop a
component from re-rendering when an external store (plate/jotai, plugin
options, zustand) notifies it, or make an expensive computation run less
often. Hook choice and debouncing are on us.

## Re-render semantics

Verified against `@platejs/core/dist/react/index.js` (v53.3.x). All editor
hooks subscribe through jotai atoms; nothing in the chain debounces. Slate
bumps three version counters on every `editor.onChange()`:
`versionEditor` (any op), `versionSelection` (only `set_selection` ops),
`versionValue` (only non-`set_selection` ops).

| Hook                                         | Subscribes to                | Re-renders on                                                                                            | Notes                                                                                                                                                   |
| -------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useEditorRef(id)`                           | nothing                      | never                                                                                                    | Stable editor instance. Use for imperative access in handlers/effects.                                                                                  |
| `usePluginOption(plugin, key)`               | that plugin option (zustand) | option change only                                                                                       | Preferred for plugin state. `usePluginOptions(plugin, selector, {equalityFn})` for derived slices.                                                      |
| `useEditorSelector(sel, deps, {equalityFn})` | tracked editor               | selector runs on **every** editor change; re-render only when `equalityFn` (default `===`) returns false | Preferred for derived state. Return primitives, or pass a custom `equalityFn` — a fresh array/object always re-renders. Selector gets `(editor, prev)`. |
| `useEditorValue()`                           | tracked value                | value change (typing)                                                                                    | Returns `editor.children` (new reference per change).                                                                                                   |
| `useValueVersion()`                          | `versionValue`               | value change (typing)                                                                                    | Cheap number payload. Pair with `useDebounce(useValueVersion() ?? 0, 300)` for index-like UI.                                                           |
| `useEditorSelection()`                       | tracked selection            | selection change                                                                                         | Returns `editor.selection` snapshot.                                                                                                                    |
| `useSelectionVersion()`                      | `versionSelection`           | selection change                                                                                         |                                                                                                                                                         |
| `useEditorVersion()`                         | `versionEditor`              | **every** editor change (value **and** selection)                                                        | Avoid in hot paths — this is what made the comment index rebuild per keystroke.                                                                         |
| `useEditorState(id)`                         | tracked editor               | every editor change                                                                                      | Exists to read fresh state during render, not to notify. Avoid.                                                                                         |

slate-react hooks (import from `slate-react` directly; `platejs/react`
re-exports only `useSelected`, `useFocused`, `useReadOnly`, `useSlateStatic`,
`useComposing`): `useSlate` force-renders on every change; prefer
`useSlateSelector(sel, equalityFn)` (redux-style, `deferred` option) or
`useSlateSelection` (deep `Range.equals`).

Legacy names that **do not exist** in v53 (pre-v40 API):
`usePlateSelector`, `usePlateControls`, `usePlateActions`, `usePlateEffects`.
Plate also ships no `useDebounce` — use `@/hooks/shadcn/use-debounce`.

Node-component hooks (`useSelected`, `useFocused`, `useReadOnly`,
`useElement`, `usePath`) are plain context reads; `useElementSelector` uses
`useSyncExternalStore` with per-element caching.

## Decision ladder

From cheapest to most expensive:

1. `useEditorRef` — imperative access; zero subscription.
2. `usePluginOption(plugin, key)` — plugin state.
3. `useEditorSelector` + custom `equalityFn` — derived editor state.
4. `useEditorValue` / `useValueVersion` — react to document edits only.
5. `useEditorSelection` / `useSelectionVersion` — react to caret moves only.
6. `useEditorVersion` / `useEditorState` — react to everything. Never feed
   these into a document-wide scan.

**Debounce rule**: any hook feeding a full-document walk
(`editor.api.nodes({ at: [] })`, `findAll`, heading scans, index builds) goes
through `useDebounce(useValueVersion() ?? 0, 300)` for index-like UI, or
`useDebounce(value, 200)` for search inputs. The
component still re-renders per keystroke (the raw subscription fires), but
memoized results keep their identity so React Compiler turns those renders
into no-ops and the expensive walk runs once per typing pause.

**React Compiler purity note**: `editor.api.nodes()` / `api.comment.node()` /
`toDOMNode()` read external mutable state. Leaving them as bare render-body
expressions lets the compiler cache them across renders whose reactive inputs
did not change — serving stale results after document edits. Always put them
in a `useMemo` whose deps include a version (raw or debounced). See
`BlockCommentContent` in `features/comment/components/ui/block-discussion.tsx`.

## Where this app uses what

Post-optimization state (see git history for the per-keystroke hotspots that
were fixed):

| Site                                                                         | Hooks                                                                                       | Notes                                                                                                                                       |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/comment/components/comment.tsx`                                    | `useEditorRef`, `usePluginOption`, `useDebounce(useValueVersion() ?? 0, 300)`               | Index rebuild once per pause.                                                                                                               |
| `features/comment/lib/block-discussion-index.ts` (`useBlockDiscussionItems`) | same + returns `version`                                                                    | WeakMap cache keyed on the debounced version; callers key doc-derived memos on it.                                                          |
| `features/comment/components/ui/block-discussion.tsx`                        | `useEditorRef`, `usePluginOption`, `useBlockDiscussionItems`                                | Node walks memoized on debounced version; skipped for blocks with no items.                                                                 |
| `features/editor/components/toc.tsx`                                         | `useEditorPlugin`, `usePluginOption`, `useEditorMounted`, `useScrollRef`, `useValueVersion` | Local `getHeadingList` (replacement for `useTocSideBarState`); rAF-throttled scroll handler; headings keyed on the debounced value version. |
| `features/editor/components/find.tsx`                                        | `useEditorRef`, `useEditorPlugin`, `usePluginOption`, `useDebounce`                         | Input 200ms + IME gate; document rescan 300ms.                                                                                              |
| `features/editor/components/editor.tsx`                                      | `useEditorValue` (`EditorValueSync`), `usePluginOption`                                     | Per-change zustand sync is accepted: no subscribers, persist debounced 1s. `BlockSelectionRangeSync` writes only on drift.                  |
| `features/editor/.../selection-kit.tsx`                                      | `useSelectionVersion`, `usePluginOption`, `useEditorReadOnly`                               | Global `selectionchange` guarded by a containment fast path.                                                                                |
| `features/chat/components/chat.tsx`                                          | `useEditorSelector` (selection text, string `===`), `usePluginOptions`                      | Cheap primitives.                                                                                                                           |
| Toolbar buttons (`components/shadcn/ui/*-toolbar-button.tsx`)                | `useEditorSelector` (marks, booleans), `useMarkToolbarButtonState`                          | Primitive results, `===` works.                                                                                                             |
| `features/chat/components/ui/ai-chat-editor.tsx`                             | `usePlateEditor` per message part                                                           | See known issues.                                                                                                                           |

## Known issues (not yet addressed)

- **One Plate editor per chat message part.** `AIChatEditor` instantiates a
  full `usePlateEditor({ plugins: BaseEditorKit })` (~24 kits) for every
  text/reasoning/tool part, and the Chat panel is force-mounted, so an entire
  persisted conversation keeps all of them alive on load. Candidate fix:
  render the last N messages with the rich editor and degrade older ones to
  plain paragraphs, or measure `content-visibility: auto` first.
- **Streaming JSON re-stringify.** Chat message rows rebuild
  `JSON.stringify(toolPart.input/output, undefined, 2)` per streamed chunk.
- **EmojiKit static import.** `@emoji-mart/data` (a large JSON dataset) is
  imported statically at module scope — bundle and startup parse cost; only
  needed once the emoji picker/combobox opens.
- **Find matches `key={index}`** — the list is fully rebuilt per scan; keys
  based on match anchors would help React reconcile, cosmetic today.
- **EditorValueSync per-keystroke zustand write** — accepted (no React
  subscribers; the persist middleware stringifies on a 1s debounce).
