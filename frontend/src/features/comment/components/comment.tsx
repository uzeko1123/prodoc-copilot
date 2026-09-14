'use client';

import { BaseBasicBlocksKit } from '@/components/shadcn/editor/plugins/basic-blocks-base-kit';
import { BaseBasicMarksKit } from '@/components/shadcn/editor/plugins/basic-marks-base-kit';
import { BasicMarksKit } from '@/components/shadcn/editor/plugins/basic-marks-kit';
import {
  discussionPlugin,
  type TDiscussion,
} from '@/components/shadcn/editor/plugins/discussion-kit';
import { BaseLinkKit } from '@/components/shadcn/editor/plugins/link-base-kit';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/ui/avatar';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/card';
import {
  formatCommentDate,
  type TComment,
} from '@/components/shadcn/ui/comment';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import {
  EditorContainer,
  Editor as PlateEditor,
} from '@/components/shadcn/ui/editor';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { ScrollArea } from '@/components/shadcn/ui/scroll-area';
import type { MyEditor } from '@/features/editor/components/editor/editor-kit';
import { cn } from 'cn';
import {
  ArrowUpIcon,
  CheckIcon,
  MessageCircleDashedIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { KEYS, NodeApi, type Value } from 'platejs';
import {
  Plate,
  useEditorPluginOption,
  useEditorRef,
  usePlateEditor,
  usePlateViewEditor,
} from 'platejs/react';
import { PlateStatic } from 'platejs/static';
import * as React from 'react';
import { useCommentStore, type TUser, type TUsers } from '../stores';

/**
 * Read-only comment bodies use the static-safe `Base*` kits only — the live
 * `BasicMarksKit` maps to dynamic components and would fail under `PlateStatic`.
 */
const CommentStaticKit = [
  ...BaseBasicBlocksKit,
  ...BaseBasicMarksKit,
  ...BaseLinkKit,
];

function CommentStaticContent({ value }: { value: Value }) {
  // One memoized static editor per comment: PlateStatic assigns editor.children
  // on render, so instances must never be shared across comments.
  const editor = usePlateViewEditor({ plugins: CommentStaticKit, value: [] });

  return (
    <PlateStatic
      editor={editor}
      value={value}
      className="text-sm break-words whitespace-break-spaces"
    />
  );
}

/** Plain text of a mini-editor value, used for the send/save disabled state. */
const textContent = (value?: Value) =>
  value ? NodeApi.string({ children: value, type: KEYS.p }) : '';

/**
 * Reply composer when `discussionId` is given, new-thread composer otherwise.
 * Each instance gets its own editor (no shared `id`), so multiple composers
 * mounted at once never collide on the global plate store.
 */
function CommentComposer({
  discussionId,
  className,
  editor,
}: {
  discussionId?: string;
  className?: string;
  editor: MyEditor;
}) {
  const addComment = useCommentStore((s) => s.addComment);
  const addDiscussion = useCommentStore((s) => s.addDiscussion);
  const currentUser = useCommentStore((s) => s.users[s.currentUserId]);

  const composerEditor = usePlateEditor({ plugins: BasicMarksKit, value: [] });
  const [value, setValue] = React.useState<Value | undefined>();

  const onSubmit = React.useCallback(() => {
    if (!value) return;
    if (textContent(value).trim().length === 0) return;

    if (discussionId) {
      addComment({ discussionId, contentRich: value, editor });
    } else {
      addDiscussion({ contentRich: value, editor });
    }

    composerEditor.tf.reset();
    setValue(undefined);
  }, [addComment, addDiscussion, discussionId, editor, composerEditor, value]);

  return (
    <div className={cn('flex w-full gap-2', className)}>
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarImage alt={currentUser?.name} src={currentUser?.avatarUrl} />
        <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="relative flex min-w-0 grow gap-2">
        <Plate
          onChange={({ value: next }) => setValue(next)}
          editor={composerEditor}
        >
          <EditorContainer variant="comment">
            <PlateEditor
              variant="comment"
              className="min-h-[25px] grow pt-0.5 pr-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder={discussionId ? 'Reply...' : 'Add a comment...'}
            />

            <Button
              size="icon-xs"
              variant="ghost"
              className="absolute right-0.5 bottom-0.5 ml-auto shrink-0"
              disabled={textContent(value).trim().length === 0}
              onClick={(e) => {
                e.stopPropagation();
                onSubmit();
              }}
              aria-label="Send comment"
            >
              <ArrowUpIcon className="size-3.5" />
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

/** Inline edit mode: live mini-editor with save/cancel replacing the body. */
function CommentEditor({
  comment,
  onCancel,
  editor,
}: {
  comment: TComment;
  onCancel: () => void;
  editor: MyEditor;
}) {
  const updateComment = useCommentStore((s) => s.updateComment);
  const user = useCommentStore((s) => s.users[comment.userId]);

  const composerEditor = usePlateEditor({
    plugins: BasicMarksKit,
    value: comment.contentRich,
  });
  const [value, setValue] = React.useState<Value | undefined>();

  const onSave = () => {
    const next = value ?? comment.contentRich;
    if (textContent(next).trim().length === 0) return;

    updateComment({
      id: comment.id,
      discussionId: comment.discussionId,
      contentRich: next,
      isEdited: true,
      editor,
    });
    onCancel();
  };

  const onCancelEdit = () => {
    // Restore a pristine clone (usePlateEditor cloned the value on init, so
    // replaceNodes never mutates the stored `contentRich`).
    composerEditor.tf.replaceNodes(comment.contentRich, {
      at: [],
      children: true,
    });
    onCancel();
  };

  return (
    <div className="flex gap-2.5">
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarImage alt={user?.name} src={user?.avatarUrl} />
        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <Plate
          onChange={({ value: next }) => setValue(next)}
          editor={composerEditor}
        >
          <EditorContainer variant="comment">
            <PlateEditor
              variant="comment"
              className="min-h-[25px] grow pt-0.5"
            />

            <div className="ml-auto flex shrink-0 gap-1">
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={onCancelEdit}
                aria-label="Cancel editing"
              >
                <XIcon className="size-3.5" />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                disabled={textContent(value).trim().length === 0}
                onClick={onSave}
                aria-label="Save comment"
              >
                <CheckIcon className="size-3.5" />
              </Button>
            </div>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  user,
  isOwner,
  isEditing,
  onEdit,
  onCancel,
  editor,
}: {
  comment: TComment;
  user?: TUser;
  isOwner: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  editor: MyEditor;
}) {
  const deleteComment = useCommentStore((s) => s.deleteComment);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);

  if (isEditing)
    return (
      <CommentEditor comment={comment} onCancel={onCancel} editor={editor} />
    );

  return (
    <div
      className="flex gap-2.5"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarImage alt={user?.name} src={user?.avatarUrl} />
        <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-foreground font-semibold">{user?.name}</span>
          <span className="text-muted-foreground">
            {formatCommentDate(comment.createdAt)}
          </span>
          {comment.isEdited && (
            <span className="text-muted-foreground">(edited)</span>
          )}

          {isOwner && (
            <div
              className={cn(
                'ml-auto',
                !(hovering || dropdownOpen) &&
                  'opacity-0 focus-within:opacity-100',
              )}
            >
              <DropdownMenu
                open={dropdownOpen}
                onOpenChange={setDropdownOpen}
                modal={false}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    aria-label="Comment actions"
                  >
                    <MoreHorizontalIcon className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onEdit}>
                      <PencilIcon className="size-4" /> Edit comment
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        deleteComment({
                          id: comment.id,
                          discussionId: comment.discussionId,
                          editor,
                        })
                      }
                    >
                      <TrashIcon className="size-4" /> Delete comment
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <CommentStaticContent value={comment.contentRich} />
      </div>
    </div>
  );
}

function DiscussionCard({
  discussion,
  users,
  currentUserId,
  editor,
}: {
  discussion: TDiscussion;
  users: TUsers;
  currentUserId: string;
  editor: MyEditor;
}) {
  const toggleResolve = useCommentStore((s) => s.toggleResolve);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const author = users[discussion.userId];
  const isMyDiscussion = discussion.userId === currentUserId;

  return (
    <Card size="sm" className="gap-0">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm" className="shrink-0">
            <AvatarImage alt={author?.name} src={author?.avatarUrl} />
            <AvatarFallback>{author?.name?.[0]}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm leading-tight font-semibold">
              {author?.name ?? 'Unknown'}
            </h4>
            <p className="text-muted-foreground text-xs">
              {formatCommentDate(discussion.createdAt)}
            </p>
          </div>

          {discussion.isResolved && <Badge variant="secondary">Resolved</Badge>}

          {isMyDiscussion && (
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={
                discussion.isResolved
                  ? 'Reopen discussion'
                  : 'Resolve discussion'
              }
              onClick={() =>
                toggleResolve({ discussionId: discussion.id, editor })
              }
            >
              {discussion.isResolved ? (
                <RotateCcwIcon className="size-3.5" />
              ) : (
                <CheckIcon className="size-3.5" />
              )}
            </Button>
          )}
        </div>

        {discussion.documentContent && (
          <p className="text-subtle-foreground text-sm">
            On: &ldquo;{discussion.documentContent}&rdquo;
          </p>
        )}

        <div className="flex flex-col gap-3">
          {discussion.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={users[comment.userId]}
              isOwner={comment.userId === currentUserId}
              isEditing={editingId === comment.id}
              onEdit={() => setEditingId(comment.id)}
              onCancel={() => setEditingId(null)}
              editor={editor}
            />
          ))}
        </div>

        <CommentComposer discussionId={discussion.id} editor={editor} />
      </CardContent>
    </Card>
  );
}

export function Comment() {
  // `Comment` renders inside the workbench `<Plate>`, so `useEditorRef` returns
  // the live editor (the one from `usePlateEditor({ plugins: EditorKit })`).
  const editor = useEditorRef<MyEditor>();
  const editorDiscussions = useEditorPluginOption(
    editor,
    discussionPlugin,
    'discussions',
  );
  const editorUsers = useEditorPluginOption(editor, discussionPlugin, 'users');
  const editorCurrentUserId = useEditorPluginOption(
    editor,
    discussionPlugin,
    'currentUserId',
  );

  React.useEffect(() => {
    useCommentStore.getState().syncEditorState({
      discussions: editorDiscussions,
      users: editorUsers,
      currentUserId: editorCurrentUserId,
    });
  }, [editorCurrentUserId, editorDiscussions, editorUsers]);

  const discussions = useCommentStore((s) => s.discussions);
  const users = useCommentStore((s) => s.users);
  const currentUserId = useCommentStore((s) => s.currentUserId);
  const [newThreadOpen, setNewThreadOpen] = React.useState(false);

  return (
    <Card className="flex h-full flex-col gap-0 rounded-none ring-0">
      <CardHeader className="gap-1 rounded-none border-b">
        <CardTitle>Comments</CardTitle>
        <CardDescription>Discussion threads on the document</CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            aria-label={
              newThreadOpen ? 'Close new comment' : 'Start a new comment'
            }
            onClick={() => setNewThreadOpen((open) => !open)}
          >
            <PlusIcon />
            {newThreadOpen ? 'Close' : 'New'}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {newThreadOpen && (
          <div className="border-b p-(--card-spacing)">
            <CommentComposer editor={editor} />
          </div>
        )}

        {discussions.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleDashedIcon />
              </EmptyMedia>
              <EmptyTitle>No comments yet</EmptyTitle>
              <EmptyDescription>
                {newThreadOpen
                  ? 'Write the first comment above, or comment on the document in the editor.'
                  : 'Comment on the document in the editor, or start a new thread.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-2 p-2">
              {discussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  users={users}
                  currentUserId={currentUserId}
                  editor={editor}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
