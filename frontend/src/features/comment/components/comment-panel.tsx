import { jumpToComment } from '../lib/comment-doc';
import { useCommentStore } from '../stores';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';
import { useEditorStore } from '@/features/editor-tiptap/stores';
import { MessageSquareIcon } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function CommentPanel() {
  const comments = useCommentStore((state) => state.comments);
  const activeCommentId = useCommentStore((state) => state.activeCommentId);
  const setActiveCommentId = useCommentStore(
    (state) => state.setActiveCommentId,
  );
  const editor = useEditorStore((state) => state.editor);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Clicking highlighted text in the editor scrolls the matching card into
  // view. Radix unmounts inactive tab content, so the panel may mount after
  // `activeCommentId` was already set — the effect also runs on mount.
  useEffect(() => {
    if (!activeCommentId) return;
    cardRefs.current[activeCommentId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [activeCommentId]);

  const handleCardClick = (id: string) => {
    setActiveCommentId(id);
    if (editor) jumpToComment(editor, id);
  };

  return (
    <div className="flex h-full flex-col">
      <Card className="h-full gap-0 rounded-none">
        <CardHeader className="gap-1 border-b">
          <CardTitle>Comments</CardTitle>
          <CardDescription>
            {comments.length === 0
              ? 'Select text and click the Comment button'
              : `${comments.length} comment${comments.length === 1 ? '' : 's'}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {comments.length === 0 ? (
            <Empty className="h-full">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquareIcon />
                </EmptyMedia>
                <EmptyTitle>No comments yet</EmptyTitle>
                <EmptyDescription>
                  Select text in the editor and click the Comment button in the
                  bubble menu.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-2 p-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    ref={(el) => {
                      // Braces, not an implicit return: React 19 treats a
                      // returned value as a cleanup function.
                      cardRefs.current[comment.id] = el;
                    }}
                    data-active={comment.id === activeCommentId || undefined}
                    onClick={() => handleCardClick(comment.id)}
                    className={`cursor-pointer rounded-lg border p-3 ${comment.id === activeCommentId ? 'bg-accent' : ''}`}
                  >
                    <p className="line-clamp-3 text-sm whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
