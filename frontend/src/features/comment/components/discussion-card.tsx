'use client';

import { type TDiscussion } from '@/components/shadcn/editor/plugins/discussion-kit';
import { BlockSuggestionCard } from '@/components/shadcn/ui/block-suggestion';
import { Button } from '@/components/shadcn/ui/button';
import { Comment, CommentCreateForm } from '@/components/shadcn/ui/comment';
import { type ResolvedSuggestion } from '@/features/comment/lib/block-discussion-index';
import { LocateFixedIcon } from 'lucide-react';
import type { Path } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';
import { focusFragment } from './focus-fragment';

const getFragmentLabel = (editor: PlateEditor, path: Path, index: number) => {
  const text = editor.api.string(path).replace(/\s+/g, ' ').trim();

  if (text.length === 0) return `#${index + 1}`;

  return text.length > 20 ? `${text.slice(0, 17).trimEnd()}…` : text;
};

function FragmentJumpButtons({
  fragmentPaths,
  id,
  kind,
}: {
  fragmentPaths: Path[];
  id: string;
  kind: 'discussion' | 'suggestion';
}) {
  const editor = useEditorRef();

  if (fragmentPaths.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {fragmentPaths.map((path, index) => (
        <Button
          key={path.join(',')}
          type="button"
          variant="outline"
          size="sm"
          className="text-muted-foreground h-6 gap-1 px-2 text-xs"
          onClick={() => focusFragment(editor, { id, kind, path })}
        >
          <LocateFixedIcon className="size-3.5" />
          {getFragmentLabel(editor, path, index)}
        </Button>
      ))}
    </div>
  );
}

export function DiscussionCard({
  discussion,
  fragmentPaths,
}: {
  discussion: TDiscussion;
  fragmentPaths: Path[];
}) {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div className="p-4">
      <FragmentJumpButtons
        fragmentPaths={fragmentPaths}
        id={discussion.id}
        kind="discussion"
      />
      {discussion.comments.map((comment, index) => (
        <Comment
          key={comment.id ?? index}
          comment={comment}
          discussionLength={discussion.comments.length}
          documentContent={discussion.documentContent}
          editingId={editingId}
          index={index}
          setEditingId={setEditingId}
          showDocumentContent
        />
      ))}
      <CommentCreateForm discussionId={discussion.id} />
    </div>
  );
}

export function SuggestionCard({
  fragmentPaths,
  suggestion,
}: {
  fragmentPaths: Path[];
  suggestion: ResolvedSuggestion;
}) {
  return (
    <div>
      <div className="px-4 pt-3">
        <FragmentJumpButtons
          fragmentPaths={fragmentPaths}
          id={suggestion.suggestionId}
          kind="suggestion"
        />
      </div>
      <BlockSuggestionCard idx={0} isLast suggestion={suggestion} />
    </div>
  );
}
