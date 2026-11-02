// @generated-by-ai

import type { Guide } from '@/api/gen/models';

export type GuideClause = {
  id?: string;
  text: string;
  line: number;
};

export type GuideSection = {
  id?: string;
  title: string;
  depth: number;
  clauses: GuideClause[];
  children: GuideSection[];
};

type SlateBlock = {
  id?: string;
  type?: string;
  children?: { text?: string }[];
};

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

const guideCache = new WeakMap<object, GuideSection>();

export function guideSectionContains(
  section: GuideSection,
  clauseId: string,
): boolean {
  if (section.clauses.some((clause) => clause.id === clauseId)) return true;
  return section.children.some((child) =>
    guideSectionContains(child, clauseId),
  );
}

export function getGuideSection(guide: Guide): GuideSection {
  const value = guide.value;
  if (!Array.isArray(value)) {
    return { title: '', depth: 0, clauses: [], children: [] };
  }

  const cached = guideCache.get(value);
  if (cached) return cached;

  const root: GuideSection = { title: '', depth: 0, clauses: [], children: [] };
  const stack: GuideSection[] = [root];

  (value as SlateBlock[]).forEach((block, i) => {
    const runs = block.children ?? [];
    const depth = block.type ? headingDepth[block.type] : undefined;

    if (depth != null) {
      const title = runs.map((run) => run.text ?? '').join('');
      if (depth === 1 && !root.title) {
        root.title = title;
      } else {
        while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
          stack.pop();
        }
        const section: GuideSection = {
          id: block.id,
          title,
          depth,
          clauses: [],
          children: [],
        };
        stack[stack.length - 1].children.push(section);
        stack.push(section);
      }
    } else {
      const text = runs.map((run) => run.text ?? '').join('');
      if (text) {
        stack[stack.length - 1].clauses.push({
          id: block.id,
          line: i + 1,
          text,
        });
      }
    }
  });

  guideCache.set(value, root);
  return root;
}

export function getGuideClauses(
  guide: Guide,
): (GuideClause & { id: string })[] {
  const items: (GuideClause & { id: string })[] = [];

  const walk = (section: GuideSection) => {
    for (const clause of section.clauses) {
      if (clause.id) items.push({ ...clause, id: clause.id });
    }
    section.children.forEach(walk);
  };

  walk(getGuideSection(guide));
  return items;
}
