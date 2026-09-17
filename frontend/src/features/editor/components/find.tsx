'use client';

import { Button } from '@/components/shadcn/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/shadcn/ui/empty';
import { Input } from '@/components/shadcn/ui/input';
import { FindReplacePlugin } from '@platejs/find-replace';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import { ElementApi, NodeApi, TextApi, type TNode, type TRange } from 'platejs';
import {
  useEditorPlugin,
  useEditorRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useMemo } from 'react';
import { findAll } from '../lib/find';

export function Find() {
  const editor = useEditorRef();
  const editorValue = useEditorValue();
  const { setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');

  const matches = useMemo(() => {
    if (!search) return [];
    const ranges = findAll(editorValue as TNode[], [], search);
    return ranges.map((range) => {
      const key = `${range.anchor.path.join('/')}:${range.anchor.offset}`;
      const root = { children: editorValue } as TNode;
      const block = NodeApi.parent(root, range.anchor.path);

      const blockNodes = ElementApi.isElement(block)
        ? (block.children as TNode[])
        : [];
      const nodeIndex = range.anchor.path.at(-1) ?? 0;
      const node = blockNodes[nodeIndex];
      const nodeBefore = blockNodes.slice(0, nodeIndex);
      const nodeAfter = blockNodes.slice(nodeIndex + 1);

      const nodeText = TextApi.isText(node) ? node.text : '';
      const text = nodeText.slice(range.anchor.offset, range.focus.offset);
      const textBefore = nodeText.slice(0, range.anchor.offset);
      const textAfter = nodeText.slice(range.focus.offset);

      const before = [...nodeBefore.map(NodeApi.string), textBefore].join('');
      const after = [...nodeAfter.map(NodeApi.string), textAfter].join('');

      return { key, range, text, before, after };
    });
  }, [editorValue, search]);

  const onClick = (range: TRange) => {
    editor.tf.select(range);
    editor.tf.focus();
    const domRange = editor.api.toDOMRange(range);
    if (domRange)
      editor.api.scrollIntoView(domRange, {
        block: 'center',
        behavior: 'smooth',
      });
  };

  return (
    <div className="scrollbar-thumb-border flex h-full scrollbar-thin flex-col gap-2 overflow-y-auto p-2">
      <Input
        value={search}
        onChange={(e) => {
          setOption('search', e.target.value);
          editor.api.redecorate();
        }}
        placeholder="Search the text..."
        type="search"
      />
      {matches.length === 0 && (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {!search ? <SearchIcon /> : <SearchXIcon />}
            </EmptyMedia>
            <EmptyTitle>{!search ? 'No search' : 'Not found'}</EmptyTitle>
            <EmptyDescription>
              {!search
                ? 'Type in the search box to find text in the document'
                : 'No matches found, try a different keyword'}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {matches.map((match) => (
        <Button
          key={match.key}
          variant="outline"
          className="h-auto p-2"
          onClick={() => onClick(match.range)}
        >
          <p className="line-clamp-3 w-full text-left text-xs whitespace-pre-wrap">
            {match.before}
            <mark className="bg-yellow-100 font-semibold">{match.text}</mark>
            {match.after}
          </p>
        </Button>
      ))}
    </div>
  );
}
