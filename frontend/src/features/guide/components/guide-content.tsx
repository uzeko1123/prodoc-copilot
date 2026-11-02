import type { Guide } from '@/api/gen/models';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/shadcn/ui/collapsible';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';
import {
  getGuideSection,
  guideSectionContains,
  type GuideClause,
  type GuideSection,
} from '../lib/guide-clause-index';
import { useGuideStore } from '../stores';
import { GuideTags } from './guide-tags';

const headingVariants = cva(
  'relative mb-1 data-[nav-target=true]:rounded-md data-[nav-target=true]:bg-(--color-highlight)',
  {
    variants: {
      variant: {
        h1: 'mt-[1.6em] pb-1 font-bold font-heading text-4xl',
        h2: 'mt-[1.4em] pb-px font-heading font-semibold text-2xl tracking-tight',
        h3: 'mt-[1em] pb-px font-heading font-semibold text-xl tracking-tight',
        h4: 'mt-[0.75em] font-heading font-semibold text-lg tracking-tight',
        h5: 'mt-[0.75em] font-semibold text-lg tracking-tight',
        h6: 'mt-[0.75em] font-semibold text-base tracking-tight',
      },
    },
  },
);

export function GuideContent({
  guide,
  className,
  interactive = false,
}: {
  guide: Guide;
  className?: string;
  interactive?: boolean;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const section = getGuideSection(guide);

  const activeGuideClauseId = useGuideStore(
    (state) => state.activeGuideClauseId,
  );
  const setActiveGuideClauseId = useGuideStore(
    (state) => state.setActiveGuideClauseId,
  );

  React.useEffect(() => {
    if (!interactive || !activeGuideClauseId) return;
    let innerAnimationFrameId = 0;
    const outerAnimationFrameId = requestAnimationFrame(() => {
      innerAnimationFrameId = requestAnimationFrame(() => {
        containerRef.current
          ?.querySelector(`[data-clause-id="${activeGuideClauseId}"]`)
          ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    });
    return () => {
      cancelAnimationFrame(innerAnimationFrameId);
      cancelAnimationFrame(outerAnimationFrameId);
    };
  }, [interactive, activeGuideClauseId]);

  return (
    <div
      ref={interactive ? containerRef : undefined}
      onClick={() => interactive && setActiveGuideClauseId(null)}
      className={cn('space-y-2 p-6 pt-0', className)}
    >
      <h1 className={cn(headingVariants({ variant: 'h1' }), 'text-base')}>
        {section.title}
      </h1>
      {section.clauses.map((clause, i) => (
        <GuideClauseContent
          key={clause.id ?? i}
          clause={clause}
          interactive={interactive}
        />
      ))}
      {section.children.map((child, i) => (
        <GuideSectionCollapsible
          key={child.id ?? i}
          section={child}
          interactive={interactive}
        />
      ))}
    </div>
  );
}
function GuideSectionCollapsible({
  section,
  interactive = false,
}: {
  section: GuideSection;
  interactive?: boolean;
}) {
  const [open, setOpen] = React.useState(true);

  const activeGuideClauseId = useGuideStore(
    (state) => state.activeGuideClauseId,
  );

  const containsActive =
    interactive &&
    !!activeGuideClauseId &&
    guideSectionContains(section, activeGuideClauseId);

  const [containedActive, setContainedActive] = React.useState(false);
  if (containsActive !== containedActive) {
    setContainedActive(containsActive);
    if (containsActive) setOpen(true);
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="group">
      <CollapsibleTrigger
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex w-fit items-center gap-1.5 hover:underline hover:underline-offset-4',
          headingVariants({
            variant: `h${section.depth}` as VariantProps<
              typeof headingVariants
            >['variant'],
          }),
          'text-base',
        )}
      >
        <ChevronDownIcon className="text-muted-foreground size-4 transition-transform group-data-[state=closed]:-rotate-90" />
        {section.title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 flex flex-col gap-2 border-l pl-4">
          {section.clauses.map((clause, i) => (
            <GuideClauseContent
              key={clause.id ?? i}
              clause={clause}
              interactive={interactive}
            />
          ))}
          {section.children.map((child, i) => (
            <GuideSectionCollapsible
              key={child.id ?? i}
              section={child}
              interactive={interactive}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function GuideClauseContent({
  clause,
  interactive = false,
}: {
  clause: GuideClause;
  interactive?: boolean;
}) {
  const activeGuideClauseId = useGuideStore(
    (state) => state.activeGuideClauseId,
  );
  const setActiveGuideClauseId = useGuideStore(
    (state) => state.setActiveGuideClauseId,
  );

  return (
    <div
      data-clause-id={clause.id}
      data-active={interactive && clause.id === activeGuideClauseId}
      onClick={
        interactive && clause.id
          ? (e) => {
              e.stopPropagation();
              setActiveGuideClauseId(clause.id ?? null);
            }
          : undefined
      }
      className={cn(
        'bg-muted/50 rounded-lg border px-3 py-2',
        interactive &&
          clause.id === activeGuideClauseId &&
          'ring-primary ring-2',
      )}
    >
      {clause.text}
      {interactive && clause.id && <GuideTags guideClauseId={clause.id} />}
    </div>
  );
}
