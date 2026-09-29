'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { acceptSuggestion, rejectSuggestion } from '@platejs/suggestion';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { CheckIcon, XIcon } from 'lucide-react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';
import * as React from 'react';
import {
  BLOCK_SUGGESTION_TOKEN,
  type ResolvedSuggestion,
} from '../../lib/block-discussion-index';
import {
  discussionPlugin,
  type TDiscussion,
} from '../editor/plugins/discussion-kit';
import { Comment, CommentCreateForm, formatCommentDate } from './comment';

// 行内格式属性的中文映射
const MARK_LABELS: Record<string, string> = {
  bold: '加粗',
  code: '代码',
  highlight: '高亮',
  italic: '斜体',
  strikethrough: '删除线',
  subscript: '下标',
  superscript: '上标',
  underline: '下划线',
};

export function BlockSuggestionCard({
  idx,
  isLast,
  suggestion,
}: {
  idx: number;
  isLast: boolean;
  suggestion: ResolvedSuggestion;
}) {
  const { api, editor } = useEditorPlugin(SuggestionPlugin);

  const userInfo = usePluginOption(discussionPlugin, 'user', suggestion.userId);

  const accept = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      acceptSuggestion(editor, suggestion);
    });
  };

  const reject = (suggestion: ResolvedSuggestion) => {
    api.suggestion.withoutSuggestions(() => {
      rejectSuggestion(editor, suggestion);
    });
  };

  const [hovering, setHovering] = React.useState(false);

  const suggestionText2Array = (text: string) => {
    if (text === BLOCK_SUGGESTION_TOKEN) return ['换行'];

    return text.split(BLOCK_SUGGESTION_TOKEN).filter(Boolean);
  };

  const getRemoveSummaryItems = (text: string) => {
    const items = suggestionText2Array(text).map((item) => {
      if (item === 'column_group') return '分栏';
      if (item === 'code_block') return '代码块';

      return item;
    });

    if (items.includes('表格')) return ['表格'];
    if (items.includes('代码块')) return ['代码块'];
    if (items.includes('分栏')) return ['分栏'];

    return items;
  };

  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <div
      key={`${suggestion.suggestionId}-${idx}`}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="flex flex-col p-4">
        <div className="relative flex items-center">
          {/* Replace to your own backend or refer to potion */}
          <Avatar className="size-5">
            <AvatarImage alt={userInfo?.name} src={userInfo?.avatarUrl} />
            <AvatarFallback>{userInfo?.name?.[0]}</AvatarFallback>
          </Avatar>
          <h4 className="mx-2 text-sm leading-none font-semibold">
            {userInfo?.name}
          </h4>
          <div className="text-muted-foreground/80 text-xs leading-none">
            <span className="mr-1">
              {formatCommentDate(new Date(suggestion.createdAt))}
            </span>
          </div>
        </div>

        <div className="relative mt-1 mb-4 pl-8">
          <div className="flex flex-col gap-2">
            {suggestion.type === 'remove' &&
              getRemoveSummaryItems(suggestion.text!).map((text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">删除：</span>

                  <span key={index} className="text-sm">
                    {text}
                  </span>
                </div>
              ))}

            {suggestion.type === 'insert' &&
              suggestionText2Array(suggestion.newText!).map((text, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">添加：</span>

                  <span key={index} className="text-sm">
                    {text || '换行'}
                  </span>
                </div>
              ))}

            {suggestion.type === 'replace' && (
              <div className="flex flex-col gap-2">
                {suggestionText2Array(suggestion.newText!).map(
                  (text, index) => (
                    <React.Fragment key={index}>
                      <div
                        key={index}
                        className="text-brand/80 flex items-start gap-2"
                      >
                        <span className="text-sm">为：</span>
                        <span className="text-sm">{text || '换行'}</span>
                      </div>
                    </React.Fragment>
                  ),
                )}

                {suggestionText2Array(suggestion.text!).map((text, index) => (
                  <React.Fragment key={index}>
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground text-sm">
                        {index === 0 ? '替换：' : '删除：'}
                      </span>
                      <span className="text-sm">{text || '换行'}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            )}

            {suggestion.type === 'update' && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  {Object.keys(suggestion.properties).map((key) => (
                    // 不翻译：未命中中文映射时回退原有英文显示
                    <span key={key}>
                      {MARK_LABELS[key]
                        ? `取消${MARK_LABELS[key]}`
                        : `Un${key}`}
                    </span>
                  ))}

                  {Object.keys(suggestion.newProperties).map((key) => (
                    // 不翻译：未命中中文映射时回退原有英文显示
                    <span key={key}>
                      {MARK_LABELS[key] ??
                        key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                  ))}
                </span>
                <span className="text-sm">{suggestion.newText}</span>
              </div>
            )}
          </div>
        </div>

        {suggestion.comments.map((comment, index) => (
          <Comment
            key={comment.id ?? index}
            comment={comment}
            discussionLength={suggestion.comments.length}
            documentContent="__suggestion__"
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
          />
        ))}

        {hovering && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="ghost"
              className="text-muted-foreground size-6 p-1"
              onClick={() => accept(suggestion)}
            >
              <CheckIcon className="size-4" />
            </Button>

            <Button
              variant="ghost"
              className="text-muted-foreground size-6 p-1"
              onClick={() => reject(suggestion)}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        <CommentCreateForm discussionId={suggestion.suggestionId} />
      </div>

      {!isLast && <div className="bg-muted h-px w-full" />}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const isResolvedSuggestion = (
  suggestion: ResolvedSuggestion | TDiscussion,
): suggestion is ResolvedSuggestion => 'suggestionId' in suggestion;
