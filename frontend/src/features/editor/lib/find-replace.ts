import { ElementApi, TextApi, type Node, type Path } from 'platejs';

/** 一次命中的区间：相对某个 text 节点的选区对 + 命中的原文 */
export type FindRange = {
  anchor: { offset: number; path: Path };
  focus: { offset: number; path: Path };
  search: string;
};

/** 在单个「纯文本叶子元素」内查找（其 children 全部是 text 节点） */
export function findReplace(
  node: Node,
  path: Path,
  search: string,
): FindRange[] {
  if (!(
    search &&
    ElementApi.isElement(node) &&
    node.children.every(TextApi.isText)
  ))
    return [];
  const texts = node.children.map((it) => it.text);
  const str = texts.join('').toLowerCase();
  const searchLower = search.toLowerCase();
  let start = 0;
  const matches = [];
  while (true) {
    start = str.indexOf(searchLower, start);
    if (start === -1) break;
    matches.push(start);
    start += searchLower.length;
  }
  if (matches.length === 0) return [];
  const ranges = [];
  let cumulativePosition = 0;
  let matchIndex = 0;
  for (const [textIndex, text] of texts.entries()) {
    const textStart = cumulativePosition;
    const textEnd = textStart + text.length;
    while (matchIndex < matches.length && matches[matchIndex] < textEnd) {
      const matchStart = matches[matchIndex];
      const matchEnd = matchStart + search.length;
      if (matchEnd <= textStart) {
        matchIndex++;
        continue;
      }
      const overlapStart = Math.max(matchStart, textStart);
      const overlapEnd = Math.min(matchEnd, textEnd);
      if (overlapStart < overlapEnd) {
        const anchorOffset = overlapStart - textStart;
        const focusOffset = overlapEnd - textStart;
        const searchOverlapStart = overlapStart - matchStart;
        const searchOverlapEnd = overlapEnd - matchStart;
        const textNodePath = [...path, textIndex];
        ranges.push({
          anchor: {
            offset: anchorOffset,
            path: textNodePath,
          },
          focus: {
            offset: focusOffset,
            path: textNodePath,
          },
          search: search.slice(searchOverlapStart, searchOverlapEnd),
        });
      }
      if (matchEnd <= textEnd) matchIndex++;
      else break;
    }
    cumulativePosition = textEnd;
  }
  return ranges;
}

/**
 * 在整个文档（子树）中递归查找，不受「children 必须全是 text」限制：
 * - 纯文本叶子元素 → 直接复用 findReplace；
 * - 含非 text 子节点的元素 → 把查找下放到每个子节点。
 */
export function findAll(
  nodes: Node[],
  path: Path,
  search: string,
): FindRange[] {
  if (!search) return [];
  const results: FindRange[] = [];
  for (const [i, node] of nodes.entries()) {
    if (!ElementApi.isElement(node)) continue;
    const childPath = [...path, i];

    if (node.children.every(TextApi.isText)) {
      results.push(...findReplace(node, childPath, search));
    } else {
      results.push(...findAll(node.children as Node[], childPath, search));
    }
  }
  return results;
}
