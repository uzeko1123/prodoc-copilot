// @generated-by-ai

import {
  getMainDiscussionsListQueryKey,
  getMainTasksRetrieveQueryKey,
  mainDiscussionsCreate,
} from '@/api/gen/endpoints/main/main';
import type { Task } from '@/api/gen/models';
import type { TSuggestionData } from '@/features/comment/lib/suggestion';
import { toastErrorMessage } from '@/lib/error-message';
import { queryClient } from '@/lib/query-client';
import { deserializeMd } from '@platejs/markdown';
import {
  BaseSuggestionPlugin,
  getSuggestionKey,
  setSuggestionNodes,
} from '@platejs/suggestion';
import {
  ElementApi,
  KEYS,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
} from 'platejs';
import type {
  Descendant,
  Path,
  TElement,
  TInlineSuggestionData,
  TNode,
  TRange,
  TSuggestionElement,
  TSuggestionText,
  TText,
} from 'platejs';
import type { PlateEditor } from 'platejs/react';

/**
 * 深度优先取 `nodes` 的首个/末个文本节点；不存在时返回 undefined
 * （如无文本子节点的 void 块）。
 */
function getEdgeText(
  nodes: Descendant[],
  edge: 'first' | 'last',
): TText | undefined {
  const order = edge === 'last' ? [...nodes].reverse() : nodes;

  for (const node of order) {
    if (TextApi.isText(node)) return node;

    const text = getEdgeText(node.children, edge);
    if (text) return text;
  }

  return undefined;
}

/**
 * 在当前选区处以插入型修订写入 markdown，返回修订数据；markdown 为空时
 * 返回 undefined（不插入任何内容）。
 *
 * `insertFragment` 会把 fragment 首块并入行内插入点所在的目标块、且丢弃
 * 块级标记，因此所有非空文本后代一律在文本层打标——文本标记能在合并后
 * 存活（空文本跳过，避免 void 内部留下幽灵标记）。顶层元素另保留块级
 * 标记，整块插入才能在拒绝时随块删除。行内元素刻意不打标：拒绝删除与
 * 已打标文本相邻的同 id 行内元素会触发库内崩溃（过期路径移除），故让
 * 它们在拒绝后存活——与库自带的 insertFragmentSuggestion 行为一致。
 *
 * 空白：CommonMark 会剥掉边缘空白，这里从原始 markdown 恢复两端，以兑现
 * 「空格/换行必须由模型写出」的约定——(a) 首尾空格与制表符并回首/末个
 * 文本节点，(b) 纯空白串按字面插入而非丢弃，(c) 边缘空行实体化为一个
 * 不打标的空段落，替真实块牺牲性地吸收 insertFragment 在插入点不在块
 * 边界时执行的首/末块拆包，让真实块保持完整。空段落只加在会被拆包的
 * 一侧，因此绝不会以可见块的形式存活。（语义对齐库在
 * `streamDeserializeMd` 中的流式补偿。）
 */
function insertSuggestion(
  editor: PlateEditor,
  md: string,
): TSuggestionData | undefined {
  if (md === '') return undefined;

  // 镜像 Slate insertFragment 的边界判定（插入点上方最近的块），得知
  // fragment 的哪一侧边缘会被拆包。
  const focus = editor.selection?.focus;
  const blockEntry = focus
    ? editor.api.block({ at: focus, above: true })
    : undefined;
  const atStart =
    !focus || !blockEntry || editor.api.isStart(focus, blockEntry[1]);
  const atEnd = !focus || !blockEntry || editor.api.isEnd(focus, blockEntry[1]);

  const fragment = deserializeMd(editor, md);
  const leadingSpaces = md.match(/^[ \t]*/)![0];
  const trailingSpaces = md.match(/[ \t]*$/)![0];
  const core = md.slice(
    leadingSpaces.length,
    md.length - trailingSpaces.length,
  );

  if (fragment.length === 0) {
    // 纯空白串解析不出任何节点：按字面插入而非丢弃
    // （如 `edit: " "` = 替换为一个空格）。
    fragment.push({ children: [{ text: md }], type: KEYS.p });
  } else {
    if (leadingSpaces) {
      const text = getEdgeText(fragment, 'first');
      if (text) text.text = leadingSpaces + text.text;
    }
    if (trailingSpaces) {
      const text = getEdgeText(fragment, 'last');
      if (text) text.text += trailingSpaces;
    }
  }

  const data: TSuggestionData = {
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    type: 'insert',
    userId:
      editor.getOptions(BaseSuggestionPlugin).currentUserId ?? 'anonymous',
    createdByAI: true,
  };
  const key = getSuggestionKey(data.id);

  const mark = (nodes: Descendant[], topLevel: boolean) => {
    for (const node of nodes) {
      if (TextApi.isText(node)) {
        if (!node.text) continue;
        const text = node as TSuggestionText;
        text.suggestion = true;
        text[key] = { ...data } as TInlineSuggestionData;
      } else {
        const element = node as TSuggestionElement;
        if (topLevel) element.suggestion = { ...data };
        mark(element.children, false);
      }
    }
  };
  mark(fragment, true);

  // 边缘空行 = 保住首/末块完整。不打标的空段落持有 fragment 的首/末
  // 叶子，insertFragment 拆包的是它（塌缩为不可见的 {text: ''}）而非
  // 真实块——详见函数头注释。
  if (core.startsWith('\n\n') && !atStart) {
    fragment.unshift({ children: [{ text: '' }], type: KEYS.p });
  }
  if (core.endsWith('\n\n') && !atEnd) {
    fragment.push({ children: [{ text: '' }], type: KEYS.p });
  }

  editor.getApi(BaseSuggestionPlugin).suggestion.withoutSuggestions(() => {
    editor.tf.insertFragment(fragment);
  });

  return data;
}

/**
 * 落库 AI 修订的条款绑定：以 suggestionId 为 key 建一条无评论的 Discussion
 * 行，guide_clauses 随行嵌套写入——修订卡上的条款 tag 与条款下的修订 tag
 * 都从该行读取，key 与编辑器 suggestion marks 的 id 一致。无指南、无条款
 * 或未产生修订时不建行；创建失败仅提示不回滚——修订 marks 本身仍有效，
 * 绑定只是辅助元数据。
 */
function saveSuggestionClauseBindings(
  editor: PlateEditor,
  taskId: string,
  aiEdit: { content: string; guideClauseIds?: string[] },
  suggestion?: TSuggestionData,
) {
  if (!suggestion || !aiEdit.guideClauseIds?.length) return;

  const task = queryClient.getQueryData<Task>(
    getMainTasksRetrieveQueryKey(taskId),
  );
  const guide = task?.guide;
  if (!guide) return;

  const documentContent = deserializeMd(editor, aiEdit.content)
    .map((node: TNode) => NodeApi.string(node))
    .join('\n');

  void mainDiscussionsCreate({
    key: suggestion.id,
    document: task?.document ?? '',
    document_content: documentContent,
    guide_clauses: aiEdit.guideClauseIds.map((block_id) => ({
      guide: guide.id,
      block_id,
    })),
  })
    .then(() =>
      queryClient.invalidateQueries({
        queryKey: getMainDiscussionsListQueryKey(),
      }),
    )
    .catch(toastErrorMessage);
}

/**
 * 将 `aiGenerate.generate` 以插入型修订写入 `range` 末尾，随后落库该 IO 的
 * 指南条款绑定（见 `saveSuggestionClauseBindings`）。
 */
export function applyGenerateSuggestion(
  editor: PlateEditor,
  range: TRange,
  aiGenerate: { content: string; generate: string; guideClauseIds?: string[] },
  taskId: string,
): void {
  editor.tf.select(RangeApi.end(range));
  const data = insertSuggestion(editor, aiGenerate.generate);

  saveSuggestionClauseBindings(editor, taskId, aiGenerate, data);
}

/**
 * 被编辑区间（文本级标记）完整覆盖时、讨论卡内预览其内容的块类型。
 * 其余被完整覆盖的块只打块级标记，卡片显示类型摘要而非内容。
 */
const PREVIEW_TYPES = new Set<string>([
  KEYS.p,
  KEYS.h1,
  KEYS.h2,
  KEYS.h3,
  KEYS.h4,
  KEYS.h5,
  KEYS.h6,
]);

/**
 * 将 `range` 作为一条修订打 remove 标记，具备块级感知：任意深度上被完整
 * 覆盖的块都打块级 remove 标记，接受时才能真正删除——仅文本级标记会留下
 * 空段落壳、且永远碰不到 void 块。预览类型块保留文本标记供卡片预览。
 * 插入的 markdown 并入 `range` 末端所在块时（`mergeIntoEndBlock`），
 * 该块绝不打块级标记，否则接受时会连同旧文本一起删掉并入的插入内容。
 */
function markRemoval(
  editor: PlateEditor,
  range: TRange,
  data: TSuggestionData,
  mergeIntoEndBlock: boolean,
): void {
  const [rangeStart, rangeEnd] = RangeApi.edges(range);

  const textMark = (at: TRange) => {
    setSuggestionNodes(editor, {
      at,
      createdAt: data.createdAt,
      suggestionId: data.id,
    });
  };
  const blockMark = (path: Path) => {
    editor.tf.setNodes<TElement>(
      { suggestion: { ...data, type: 'remove' } },
      { at: path },
    );
  };

  const visit = (at: Path) => {
    for (const [child, childPath] of NodeApi.children(editor, at)) {
      if (!ElementApi.isElement(child) || editor.api.isInline(child)) continue;

      const start = editor.api.start(childPath);
      const end = editor.api.end(childPath);
      if (!start || !end) continue;

      const childRange = { anchor: start, focus: end };
      const covered =
        PointApi.compare(start, rangeStart) >= 0 &&
        PointApi.compare(end, rangeEnd) <= 0;
      const holdsInsertion =
        mergeIntoEndBlock &&
        (PathApi.isAncestor(childPath, rangeEnd.path) ||
          PathApi.equals(childPath, rangeEnd.path));

      if (covered && !holdsInsertion) {
        blockMark(childPath);

        // childRange 塌缩（空段落）时跳过：setSuggestionNodes 会回落到
        // 整块 setNodes，用文本样式键覆盖上面刚设的块标记。
        if (
          child.type &&
          PREVIEW_TYPES.has(child.type) &&
          !RangeApi.isCollapsed(childRange)
        ) {
          textMark(childRange);
        }

        // 已完整覆盖：无需继续下探。
        continue;
      }

      // 部分覆盖，或插入目标块（它必须在接受后存活以承接并入的插入内容）。
      // 塌缩的交集跳过：打标会落到整块上。
      const intersection = RangeApi.intersection(range, childRange);
      if (intersection && !RangeApi.isCollapsed(intersection)) {
        textMark(intersection);
      }

      // 为完整覆盖的嵌套块下探（列表项、表格行……）。
      visit(childPath);
    }
  };

  visit([]);
}

/**
 * 将 `range` 作为一条原子修订整体替换或删除：先在区间末端插入（保持区间
 * 端点有效），再给区间打 remove 标记并复用插入 id，接受/拒绝对两者同时
 * 生效。完整覆盖的块打块级标记，接受时直接删除（见 `markRemoval`）。
 * 塌缩区间无法打 remove 标记（标记会落到整块上），退化为纯插入。IO 的
 * 指南条款绑定随后一并落库（见 `saveSuggestionClauseBindings`）。
 */
export function applyEditSuggestion(
  editor: PlateEditor,
  range: TRange,
  aiEdit: { content: string; edit: string; guideClauseIds?: string[] },
  taskId: string,
): void {
  let data: TSuggestionData | undefined;

  if (aiEdit.edit.length > 0) {
    editor.tf.select(RangeApi.end(range));
    data = insertSuggestion(editor, aiEdit.edit);
  }
  if (!RangeApi.isCollapsed(range)) {
    // 纯删除：合成一个 UUID id，修订才可被批注（批注行以修订 id 为键，
    // 必须是 UUID）。
    data ??= {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      type: 'remove',
      userId:
        editor.getOptions(BaseSuggestionPlugin).currentUserId ?? 'anonymous',
      createdByAI: true,
    };
    // 插入的首行会并入末端块，除非 markdown 以空行开头（牺牲段落吸收
    // 该合并）。
    const core = aiEdit.edit.replace(/^[ \t]*/, '').replace(/[ \t]*$/, '');

    markRemoval(
      editor,
      range,
      data,
      aiEdit.edit.length > 0 && !core.startsWith('\n\n'),
    );
  }

  saveSuggestionClauseBindings(editor, taskId, aiEdit, data);
}
