'use client';

import {
  useAuthUserRetrieve,
  useAuthUsersRetrieve,
} from '@/api/gen/endpoints/auth/auth';
import {
  getMainDiscussionsListQueryKey,
  useMainCommentsCreate,
  useMainCommentsDestroy,
  useMainCommentsPartialUpdate,
  useMainDiscussionsCreate,
  useMainDiscussionsList,
  useMainDiscussionsPartialUpdate,
  useMainTasksRetrieve,
} from '@/api/gen/endpoints/main/main';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { Editor, EditorContainer } from '@/components/shadcn/ui/editor';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import { UserAvatar } from '@/features/auth/components/user-avatar';
import { useStageUser } from '@/features/auth/hooks/use-stage-user';
import { BasicMarksKit } from '@/features/editor/components/editor/plugins/basic-marks-kit';
import { toastErrorMessage } from '@/lib/error-message';
import { formatDate } from '@/lib/format-date';
import { queryClient } from '@/lib/query-client';
import { getCommentKey, getDraftCommentKey } from '@platejs/comment';
import { CommentPlugin, useCommentId } from '@platejs/comment/react';
import { useParams } from '@tanstack/react-router';
import { cn } from 'cn';
import {
  ArrowUpIcon,
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SparklesIcon,
  TrashIcon,
  UndoIcon,
  XIcon,
} from 'lucide-react';
import {
  KEYS,
  NodeApi,
  type NodeEntry,
  type TCommentText,
  type Value,
} from 'platejs';
import type { CreatePlateEditorOptions } from 'platejs/react';
import {
  createPlatePlugin,
  getEditorPlugin,
  Plate,
  useEditorPlugin,
  useEditorRef,
  usePlateEditor,
} from 'platejs/react';
import * as React from 'react';
import { useCommentStore } from '../../stores';
import { DiscussionTags } from '../discussion-tags';
import { commentPlugin } from '../editor/plugins/comment-kit';

export type TComment = {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
  createdByAI?: boolean;
};

export function Comment(props: {
  comment: TComment;
  discussionLength: number;
  editingId: string | null;
  index: number;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  documentContent?: string;
  showDocumentContent?: boolean;
  onEditorClick?: () => void;
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    onEditorClick,
  } = props;

  const { data: me } = useAuthUserRetrieve();

  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const { data: user } = useAuthUsersRetrieve(Number(comment.userId), {
    query: { throwOnError: false },
  });

  const { mutate: discussionsPartialUpdateMutate } =
    useMainDiscussionsPartialUpdate({
      mutation: {
        onSuccess: () => {
          void queryClient.invalidateQueries({
            queryKey: getMainDiscussionsListQueryKey(),
          });
        },
      },
    });

  const { mutate: commentsPartialUpdateMutate } = useMainCommentsPartialUpdate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainDiscussionsListQueryKey(),
        });
      },
    },
  });

  const toggleDiscussionResolved = async (id: string) => {
    const discussion = discussions?.find((discussion) => discussion.key === id);
    if (discussion) {
      discussionsPartialUpdateMutate({
        id: discussion.id,
        data: { is_resolved: !discussion.is_resolved },
      });
    }
  };

  const updateComment = async (input: {
    id: string;
    contentRich: Value;
    discussionId: string;
    isEdited: boolean;
  }) => {
    const discussion = discussions?.find(
      (discussion) => discussion.key === input.discussionId,
    );
    if (discussion) {
      commentsPartialUpdateMutate({
        id: comment.id,
        data: { content_rich: input.contentRich },
      });
    }
  };

  const { tf } = useEditorPlugin(CommentPlugin);

  // Replace to your own backend or refer to potion
  const isMyComment = (me ? String(me.pk) : '') === comment.userId;
  const stageUser = useStageUser(task);
  const isStageUser = !!stageUser && stageUser.pk === me?.pk;

  const isResolved =
    discussions?.find((discussion) => discussion.key === comment.discussionId)
      ?.is_resolved ?? false;

  const initialValue = comment.contentRich;

  const commentEditor = useCommentEditor(
    {
      id: comment.id,
      value: initialValue,
    },
    [initialValue],
  );

  const onCancel = () => {
    setEditingId(null);
    commentEditor.tf.replaceNodes(initialValue, {
      at: [],
      children: true,
    });
  };

  const onSave = () => {
    void updateComment({
      id: comment.id,
      contentRich: commentEditor.children,
      discussionId: comment.discussionId,
      isEdited: true,
    });
    setEditingId(null);
  };

  const onResolveComment = () => {
    void toggleDiscussionResolved(comment.discussionId);
  };

  const isFirst = index === 0;
  const isLast = index === discussionLength - 1;
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative flex items-center">
        <UserAvatar user={user} className="size-5" />
        <h4 className="mx-2 text-sm leading-none font-semibold">
          {user?.full_name || user?.username || '未知用户'}
        </h4>

        {comment.createdByAI && (
          <Tooltip>
            <TooltipTrigger asChild>
              <SparklesIcon className="text-primary mr-2 size-3" />
            </TooltipTrigger>
            <TooltipContent>由 AI 生成</TooltipContent>
          </Tooltip>
        )}

        <div className="text-muted-foreground/80 text-xs leading-none">
          <span className="mr-1">{formatDate(comment.createdAt)}</span>
          {isFirst && isResolved ? (
            <span>（已解决）</span>
          ) : (
            comment.isEdited && <span>（已编辑）</span>
          )}
        </div>
        {isMyComment && isStageUser && (hovering || dropdownOpen) && (
          <div className="absolute top-0 right-0 flex space-x-1">
            {index === 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground h-6 p-1"
                    onClick={onResolveComment}
                    type="button"
                  >
                    {isResolved ? (
                      <UndoIcon className="size-4" />
                    ) : (
                      <CheckIcon className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isResolved ? '标记为未解决' : '标记为已解决'}
                </TooltipContent>
              </Tooltip>
            )}

            {!isResolved && (
              <CommentMoreDropdown
                onCloseAutoFocus={() => {
                  setTimeout(() => {
                    commentEditor.tf.focus({ edge: 'endEditor' });
                  }, 0);
                }}
                onRemoveComment={() => {
                  if (discussionLength === 1) {
                    tf.comment.unsetMark({ id: comment.discussionId });
                  }
                }}
                comment={comment}
                dropdownOpen={dropdownOpen}
                setDropdownOpen={setDropdownOpen}
                setEditingId={setEditingId}
              />
            )}
          </div>
        )}
      </div>

      <div className="relative pb-px">
        {!isLast && (
          <div className="bg-muted absolute top-0 bottom-1 left-2.25 w-0.5 shrink-0" />
        )}

        {isFirst && showDocumentContent && (
          <div className="text-subtle-foreground mt-1 flex pl-8 text-sm">
            <div className="bg-highlight my-px w-0.5 shrink-0" />
            {documentContent && (
              <div className="ml-2 wrap-anywhere">{documentContent}</div>
            )}
          </div>
        )}

        <div className="mt-1 mb-2 pl-6.5">
          <Plate readOnly={!isEditing} editor={commentEditor}>
            <EditorContainer variant="comment">
              <Editor
                variant="comment"
                className="w-auto grow"
                onClick={() => onEditorClick?.()}
                onKeyDown={(e) => {
                  if (isEditing && e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSave();
                  }
                }}
              />

              {isEditing && (
                <div className="ml-auto flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      void onCancel();
                    }}
                  >
                    <div className="bg-primary/40 flex size-5 shrink-0 items-center justify-center rounded-[50%]">
                      <XIcon className="text-background size-3 stroke-[3px]" />
                    </div>
                  </Button>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      void onSave();
                    }}
                  >
                    <div className="bg-brand flex size-5 shrink-0 items-center justify-center rounded-[50%]">
                      <CheckIcon className="text-background size-3 stroke-[3px]" />
                    </div>
                  </Button>
                </div>
              )}
            </EditorContainer>
          </Plate>
        </div>

        {isFirst && showDocumentContent && (
          <DiscussionTags discussionKey={comment.discussionId} />
        )}
      </div>
    </div>
  );
}

function CommentMoreDropdown(props: {
  comment: TComment;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  onCloseAutoFocus?: () => void;
  onRemoveComment?: () => void;
}) {
  const {
    comment,
    dropdownOpen,
    setDropdownOpen,
    setEditingId,
    onCloseAutoFocus,
    onRemoveComment,
  } = props;

  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const { mutate: commentsDestroyMutate } = useMainCommentsDestroy({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainDiscussionsListQueryKey(),
        });
      },
    },
  });

  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onDeleteComment = React.useCallback(() => {
    const discussion = discussions?.find(
      (discussion) => discussion.key === comment.discussionId,
    );
    if (discussion) {
      commentsDestroyMutate({ id: comment.id });
    }
    onRemoveComment?.();
  }, [
    comment.discussionId,
    comment.id,
    discussions,
    onRemoveComment,
    commentsDestroyMutate,
  ]);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;
    setEditingId(comment.id);
  }, [comment.id, setEditingId]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className={cn('text-muted-foreground h-6 p-1')}
            >
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>更多</TooltipContent>
      </Tooltip>
      <DropdownMenuContent
        className="w-48"
        onCloseAutoFocus={(e) => {
          if (selectedEditCommentRef.current) {
            onCloseAutoFocus?.();
            selectedEditCommentRef.current = false;
          }

          return e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <PencilIcon className="size-4" />
            编辑评论
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <TrashIcon className="size-4" />
            删除评论
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const softBreakPlugin = createPlatePlugin({
  key: 'softBreak',
  shortcuts: {
    insertSoftBreak: {
      keys: 'shift+enter',
      handler: ({ editor }) => {
        editor.tf.insertSoftBreak();
      },
    },
  },
});

const useCommentEditor = (
  options: Omit<CreatePlateEditorOptions, 'plugins'> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[] = [],
) => {
  const commentEditor = usePlateEditor(
    {
      id: 'comment',
      plugins: [...BasicMarksKit, softBreakPlugin],
      value: [],
      ...options,
    },
    deps,
  );

  return commentEditor;
};

export function CommentCreateForm({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  focusOnMount = false,
}: {
  autoFocus?: boolean;
  className?: string;
  discussionId?: string;
  focusOnMount?: boolean;
}) {
  const editor = useEditorRef();
  const { taskId } = useParams({ from: '/workbench/$taskId/' });
  const { data: task } = useMainTasksRetrieve(taskId);
  const documentId = task?.document ?? '';

  const commentEditor = useCommentEditor();
  const commentId = useCommentId();
  const discussionId = discussionIdProp ?? commentId;

  const { data: me } = useAuthUserRetrieve();

  const { data: discussions } = useMainDiscussionsList(
    { document: documentId },
    { query: { enabled: !!documentId } },
  );

  const { mutate: discussionsCreateMutate } = useMainDiscussionsCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainDiscussionsListQueryKey(),
        });
      },
      onError: (error, variables) => {
        getEditorPlugin(editor, CommentPlugin).tf.comment.unsetMark({
          id: variables.data.key,
        });
        toastErrorMessage(error);
      },
    },
  });

  const { mutate: commentsCreateMutate } = useMainCommentsCreate({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: getMainDiscussionsListQueryKey(),
        });
      },
    },
  });

  const discussionDraftKey = discussionId ?? getDraftCommentKey();
  const discussionDraftValue = useCommentStore(
    (state) => state.discussionDrafts[discussionDraftKey],
  );
  const hasDiscussionDraftValue = React.useMemo(
    () =>
      discussionDraftValue
        ? NodeApi.string({
            children: discussionDraftValue,
            type: KEYS.p,
          }).trim() !== ''
        : true,
    [discussionDraftValue],
  );

  React.useEffect(() => {
    if (commentEditor && focusOnMount) {
      commentEditor.tf.focus();
    }
  }, [commentEditor, focusOnMount]);

  React.useEffect(() => {
    if (!commentEditor) return;
    if (commentEditor.api.isFocused()) return;

    if (discussionDraftValue) {
      commentEditor.tf.setValue(discussionDraftValue);
    } else {
      commentEditor.tf.reset();
    }
  }, [commentEditor, discussionDraftValue]);

  const onAddComment = React.useCallback(async () => {
    if (!documentId) return;

    const commentValue =
      useCommentStore.getState().discussionDrafts[discussionDraftKey];
    if (!commentValue) return;

    commentEditor.tf.reset();
    useCommentStore.getState().removeDiscussionDraft(discussionDraftKey);

    if (discussionId) {
      // Get existing discussion
      const discussion = discussions?.find(
        (discussion) => discussion.key === discussionId,
      );
      if (!discussion) {
        discussionsCreateMutate({
          data: {
            key: discussionId,
            document: documentId,
            comment_inline: {
              key: crypto.randomUUID(),
              content_rich: commentValue,
            },
          },
        });
        return;
      }

      // Create reply comment
      commentsCreateMutate({
        data: {
          key: crypto.randomUUID(),
          discussion: discussion.id,
          content_rich: commentValue,
        },
      });

      return;
    }

    const commentsNodeEntry = editor
      .getApi(CommentPlugin)
      .comment.nodes({ at: [], isDraft: true });

    if (commentsNodeEntry.length === 0) return;

    const documentContent = commentsNodeEntry
      .map(([node]: NodeEntry<TCommentText>) => node.text)
      .join('');

    const _discussionId = crypto.randomUUID();
    const _commentId = crypto.randomUUID();

    discussionsCreateMutate({
      data: {
        key: _discussionId,
        document: documentId,
        document_content: documentContent,
        comment_inline: { key: _commentId, content_rich: commentValue },
      },
    });

    const id = _discussionId;

    commentsNodeEntry.forEach(([, path]: NodeEntry<TCommentText>) => {
      editor.tf.setNodes(
        {
          [getCommentKey(id)]: true,
        },
        { at: path, split: true },
      );
      editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
    });

    editor.setOption(commentPlugin, 'activeId', null);
    editor.setOption(commentPlugin, 'commentingBlock', null);
  }, [
    editor,
    discussions,
    commentEditor.tf,
    documentId,
    discussionId,
    discussionDraftKey,
    discussionsCreateMutate,
    commentsCreateMutate,
  ]);

  return (
    <div className={cn('flex w-full', className)}>
      <div className="mr-1 shrink-0">
        <UserAvatar user={me} className="size-5" />
      </div>

      <div className="relative flex grow gap-2">
        <Plate
          onChange={({ value }) => {
            if (commentEditor.api.isFocused()) {
              useCommentStore
                .getState()
                .upsertDiscussionDraft(discussionDraftKey, value);
            }
          }}
          editor={commentEditor}
        >
          <EditorContainer variant="comment">
            <Editor
              variant="comment"
              className="w-auto grow wrap-anywhere"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onAddComment();
                }
              }}
              placeholder="添加评论 . . ."
              autoComplete="off"
              autoFocus={autoFocus}
            />

            <Button
              size="icon"
              variant="ghost"
              className="ml-auto flex shrink-0 gap-1"
              disabled={!hasDiscussionDraftValue}
              onClick={(e) => {
                e.stopPropagation();
                onAddComment();
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-full">
                <ArrowUpIcon />
              </div>
            </Button>
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}
