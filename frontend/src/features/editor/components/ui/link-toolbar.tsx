'use client';

import { buttonVariants } from '@/components/shadcn/ui/button';
import { Separator } from '@/components/shadcn/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';
import {
  flip,
  offset,
  shift,
  type UseVirtualFloatingOptions,
} from '@platejs/floating';
import { getLinkAttributes } from '@platejs/link';
import {
  FloatingLinkUrlInput,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
  type LinkFloatingToolbarState,
} from '@platejs/link/react';
import { cva } from 'class-variance-authority';
import { ExternalLink, Link, Text, Unlink } from 'lucide-react';
import type { TLinkElement } from 'platejs';
import { KEYS } from 'platejs';
import {
  useEditorContainerRef,
  useEditorMounted,
  useEditorRef,
  useEditorSelection,
  useFormInputProps,
  usePluginOption,
  useScrollRef,
} from 'platejs/react';
import * as React from 'react';

const popoverVariants = cva(
  'z-50 w-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md outline-hidden',
);

const inputVariants = cva(
  'flex h-[28px] w-full rounded-md border-none bg-transparent px-1.5 py-1 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-transparent md:text-sm',
);

export function LinkFloatingToolbar({
  state,
}: {
  state?: LinkFloatingToolbarState;
}) {
  const activeCommentId = usePluginOption({ key: KEYS.comment }, 'activeId');
  const activeSuggestionId = usePluginOption(
    { key: KEYS.suggestion },
    'activeId',
  );

  const floatingOptions: UseVirtualFloatingOptions = React.useMemo(
    () => ({
      placement: activeSuggestionId || activeCommentId ? 'top' : 'bottom',
      middleware: [
        offset(8),
        flip({
          fallbackPlacements: ['bottom', 'top'],
          padding: 12,
        }),
        shift({
          mainAxis: true,
          crossAxis: false,
          padding: 12,
        }),
      ],
    }),
    [activeCommentId, activeSuggestionId],
  );

  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    hidden,
    props: insertProps,
    ref: insertRef,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    editButtonProps,
    props: editProps,
    ref: editRef,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);
  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown: true,
  });

  const editorMounted = useEditorMounted();
  const scrollRef = useScrollRef();
  const containerRef = useEditorContainerRef();
  const update = React.useCallback(() => {
    insertState.floating.update();
    editState.floating.update();
  }, [insertState.floating, editState.floating]);

  React.useEffect(() => {
    if (!editorMounted) return;
    const scroll = scrollRef.current;
    if (!scroll) return;

    scroll.addEventListener('scroll', update, { passive: true });
    return () => scroll.removeEventListener('scroll', update);
  }, [editorMounted, scrollRef, update]);

  React.useEffect(() => {
    if (!editorMounted) return;
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [editorMounted, containerRef, update]);

  if (hidden) return null;

  const input = (
    <div className="flex w-82.5 flex-col" {...inputProps}>
      <div className="flex items-center">
        <div className="text-muted-foreground flex items-center pr-1 pl-2">
          <Link className="size-4" />
        </div>

        <FloatingLinkUrlInput
          className={inputVariants()}
          placeholder="链接地址 . . ."
          data-plate-focus
        />
      </div>
      <Separator className="my-1" />
      <div className="flex items-center">
        <div className="text-muted-foreground flex items-center pr-1 pl-2">
          <Text className="size-4" />
        </div>
        <input
          className={inputVariants()}
          placeholder="展示文本 . . ."
          data-plate-focus
          {...textInputProps}
        />
      </div>
    </div>
  );

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className="box-content flex items-center">
      <button
        className={buttonVariants({ size: 'sm', variant: 'ghost' })}
        type="button"
        {...editButtonProps}
      >
        编辑链接
      </button>

      <Separator orientation="vertical" />

      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <LinkOpenButton />
          </div>
        </TooltipTrigger>
        <TooltipContent>打开链接</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={buttonVariants({
              size: 'sm',
              variant: 'ghost',
            })}
            type="button"
            {...unlinkButtonProps}
          >
            <Unlink width={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent>删除链接</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <>
      <div ref={insertRef} className={popoverVariants()} {...insertProps}>
        {input}
      </div>

      <div ref={editRef} className={popoverVariants()} {...editProps}>
        {editContent}
      </div>
    </>
  );
}

function LinkOpenButton() {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const attributes = React.useMemo(
    () => {
      const entry = editor.api.node<TLinkElement>({
        match: { type: editor.getType(KEYS.link) },
      });
      if (!entry) {
        return {};
      }
      const [element] = entry;
      return getLinkAttributes(editor, element);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, selection],
  );

  return (
    <a
      {...attributes}
      className={buttonVariants({
        size: 'sm',
        variant: 'ghost',
      })}
      onMouseOver={(e) => {
        e.stopPropagation();
      }}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      <ExternalLink width={18} />
    </a>
  );
}
