'use client';

import { commentPlugin } from '@/features/editor/components/editor/plugins/comment-kit';
import { suggestionPlugin } from '@/features/editor/components/editor/plugins/suggestion-kit';
import { getDraftCommentKey } from '@platejs/comment';
import { usePluginOption } from 'platejs/react';
import * as React from 'react';
import { useDocumentDiscussionItems } from '../lib/block-discussion-index';
import { DiscussionCard, SuggestionCard } from './discussion-card';

export function Comment() {
  const items = useDocumentDiscussionItems();
  const activeCommentId = usePluginOption(commentPlugin, 'activeId');
  const activeSuggestionId = usePluginOption(suggestionPlugin, 'activeId');

  const cardRefs = React.useRef(new Map<string, HTMLDivElement>());
  const [flashedKey, setFlashedKey] = React.useState<string | null>(null);

  const registerCard = (key: string) => (node: HTMLDivElement | null) => {
    if (node) cardRefs.current.set(key, node);
    else cardRefs.current.delete(key);
  };

  React.useEffect(() => {
    const key =
      (activeCommentId &&
        activeCommentId !== getDraftCommentKey() &&
        `discussion:${activeCommentId}`) ||
      (activeSuggestionId && `suggestion:${activeSuggestionId}`);

    if (!key) return;

    const element = cardRefs.current.get(key);
    if (!element) return;

    element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setFlashedKey(key);

    const timer = setTimeout(() => setFlashedKey(null), 1200);

    return () => clearTimeout(timer);
  }, [activeCommentId, activeSuggestionId, items]);

  return (
    <div className="scrollbar-thumb-border flex h-full scrollbar-thin flex-col overflow-y-auto">
      {items.map((item, index) => {
        const key =
          item.kind === 'discussion'
            ? `discussion:${item.discussion.id}`
            : `suggestion:${item.suggestion.suggestionId}`;

        return (
          <div
            key={key}
            ref={registerCard(key)}
            className={flashedKey === key ? 'bg-highlight/15' : undefined}
          >
            {item.kind === 'discussion' ? (
              <DiscussionCard
                discussion={item.discussion}
                fragmentPaths={item.fragmentPaths}
              />
            ) : (
              <SuggestionCard
                fragmentPaths={item.fragmentPaths}
                suggestion={item.suggestion}
              />
            )}
            {index < items.length - 1 && (
              <div className="bg-muted h-px w-full" />
            )}
          </div>
        );
      })}
    </div>
  );
}
