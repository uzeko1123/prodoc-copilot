// @generated-by-ai

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/shadcn/ui/collapsible';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

interface SlateBlock {
  id?: string;
  type?: string;
  children?: { text?: string }[];
}

interface GuideClause {
  id?: string;
  text: string;
}

interface GuideSection {
  id?: string;
  title: string;
  depth: number;
  clauses: GuideClause[];
  children: GuideSection[];
}

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

// 与 shadcn/ui/heading-node-static.tsx 的 headingVariants 保持一致
const headingClasses: Record<number, string> = {
  1: 'mt-[1.6em] pb-1 font-bold font-heading text-4xl',
  2: 'mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight',
  3: 'mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight',
  4: 'mt-[0.75em] font-heading font-semibold text-lg tracking-tight',
  5: 'mt-[0.75em] font-semibold text-lg tracking-tight',
  6: 'mt-[0.75em] font-semibold text-base tracking-tight',
};

// compact：标题统一降为 text-base（经 tailwind-merge 覆盖各级标题字号）
const guideVariants = cva('', {
  variants: {
    variant: {
      default: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

function parseGuide(value: unknown): GuideSection {
  const root: GuideSection = {
    title: '',
    depth: 0,
    clauses: [],
    children: [],
  };
  const stack: GuideSection[] = [root];

  for (const block of Array.isArray(value) ? (value as SlateBlock[]) : []) {
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
      if (text) stack[stack.length - 1].clauses.push({ id: block.id, text });
    }
  }
  return root;
}

function GuideClauseBox({ clause }: { clause: GuideClause }) {
  return (
    <div className="bg-muted/40 rounded-lg border px-4 py-2 text-sm leading-relaxed">
      {clause.text}
    </div>
  );
}

function GuideSectionNode({
  section,
  variant,
}: {
  section: GuideSection;
  variant: VariantProps<typeof guideVariants>['variant'];
}) {
  const [open, setOpen] = React.useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <CollapsibleTrigger
        className={cn(
          'flex w-full items-center gap-1.5 text-left hover:underline hover:underline-offset-4',
          headingClasses[section.depth],
          guideVariants({ variant }),
        )}
      >
        <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
        {section.title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 space-y-2 border-l py-1 pl-4">
          {section.clauses.map((clause, i) => (
            <GuideClauseBox key={clause.id ?? i} clause={clause} />
          ))}
          {section.children.map((child, i) => (
            <GuideSectionNode
              key={child.id ?? i}
              section={child}
              variant={variant}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function GuideContent({
  value,
  className,
  variant = 'default',
}: {
  value: unknown;
  className?: string;
} & VariantProps<typeof guideVariants>) {
  const guide = React.useMemo(() => parseGuide(value), [value]);

  return (
    <div className={cn('space-y-2 pb-12', className)}>
      {guide.title && (
        <h1 className={cn(headingClasses[1], guideVariants({ variant }))}>
          {guide.title}
        </h1>
      )}
      {guide.clauses.map((clause, i) => (
        <GuideClauseBox key={clause.id ?? i} clause={clause} />
      ))}
      {guide.children.map((child, i) => (
        <GuideSectionNode
          key={child.id ?? i}
          section={child}
          variant={variant}
        />
      ))}
    </div>
  );
}
