'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { FindReplacePlugin } from '@platejs/find-replace';
import type { Node } from 'platejs';
import {
  useEditorPlugin,
  useEditorRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useMemo } from 'react';
import { findAll, type FindRange } from '../lib/find-replace';

export function Find() {
  const editor = useEditorRef();
  const editorValue = useEditorValue();
  const { setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');

  const findRanges = useMemo(() => {
    if (!search) return [];
    return findAll(editorValue as Node[], [], search);
  }, [editorValue, search]);

  const onClick = (findRange: FindRange) => {
    editor.tf.select(findRange);
    editor.tf.focus();
    const node = editor.api.node(findRange.anchor.path)?.[0];
    const el = node ? editor.api.toDOMNode(node) : undefined;
    el?.scrollIntoView({
      block: 'center',
      behavior: 'smooth',
    });
  };

  return (
    <div className="scrollbar-thumb-border h-full scrollbar-thin overflow-y-auto p-2">
      <Input
        value={search}
        onChange={(e) => {
          setOption('search', e.target.value);
          editor.api.redecorate();
        }}
        placeholder="Search the text..."
        type="search"
      />
      <div className="flex w-full flex-col gap-2 py-2">
        {findRanges.length > 0 ? (
          findRanges.map((findRange) => (
            <Button
              variant="outline"
              className="h-auto p-2"
              onClick={() => onClick(findRange)}
            >
              <p className="line-clamp-3 w-full text-left text-xs whitespace-pre-wrap">
                {findRange.search}
              </p>
            </Button>
          ))
        ) : (
          <p>Not found</p>
        )}
      </div>
    </div>
  );
}
