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
import { Separator } from '@/components/shadcn/ui/separator';
import { useDebounce } from '@/hooks/shadcn/use-debounce';
import { FindReplacePlugin } from '@platejs/find-replace';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import { ElementApi, NodeApi, TextApi, type TNode, type TRange } from 'platejs';
import { useEditorRef, useEditorValue, usePluginOption } from 'platejs/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { findAll } from '../lib/find';

export function Find() {
  const editor = useEditorRef();
  const search = usePluginOption(FindReplacePlugin, 'search');

  const [input, setInput] = useState(search ?? '');
  const debouncedInput = useDebounce(input);
  const [isComposing, setIsComposing] = useState(false);
  const lastSearchRef = useRef(search ?? '');

  useEffect(() => {
    if (isComposing) return;
    const currentSearch = search ?? '';
    if (debouncedInput === currentSearch) return;
    if (lastSearchRef.current !== currentSearch) {
      lastSearchRef.current = currentSearch;
      setInput(currentSearch);
      return;
    }
    lastSearchRef.current = debouncedInput;
    editor.setOption(FindReplacePlugin, 'search', debouncedInput);
    clearFlashRange();
    editor.api.redecorate();
  }, [editor, search, isComposing, debouncedInput]);

  useEffect(() => {
    return () => {
      if (!editor.getOption(FindReplacePlugin, 'search')) return;
      editor.setOption(FindReplacePlugin, 'search', '');
      clearFlashRange();
      editor.api.redecorate();
    };
  }, [editor]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="Search the text..."
          type="search"
        />
      </div>
      <Separator />
      {search ? (
        <FindMatches search={search} />
      ) : (
        <FindEmpty
          description="Type in the search box to find text in the document"
          icon={<SearchIcon />}
          title="No search"
        />
      )}
    </div>
  );
}

function FindMatches({ search }: { search: string }) {
  const editor = useEditorRef();
  const editorValue = useDebounce(useEditorValue());

  const matches = useMemo(() => {
    if (!search) return [];
    const ranges = findAll(editorValue as TNode[], [], search);
    return ranges.map((range) => {
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

      return { range, text, before, after };
    });
  }, [editorValue, search]);

  const onClick = (range: TRange) => {
    const domRange = editor.api.toDOMRange(range);
    if (!domRange) return;
    editor.api.scrollIntoView(domRange, {
      block: 'center',
      behavior: 'smooth',
    });
    flashRange(domRange);
  };

  return (
    <>
      {matches.length === 0 && (
        <FindEmpty
          icon={<SearchXIcon />}
          title="Not found"
          description="No matches found, try a different keyword"
        />
      )}
      <div className="flex flex-col gap-2 overflow-y-auto p-2">
        {matches.map((match) => (
          <Button
            key={getRangeKey(match.range)}
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
    </>
  );
}

function FindEmpty({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

let flashTimeout: ReturnType<typeof setTimeout> | undefined;

function flashRange(domRange: Range) {
  CSS.highlights.delete('flash-range');
  CSS.highlights.set('flash-range', new Highlight(domRange));

  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => {
    CSS.highlights.delete('flash-range');
  }, 1600);
}

function clearFlashRange() {
  clearTimeout(flashTimeout);
  CSS.highlights.delete('flash-range');
}

function getRangeKey(range: TRange) {
  return `${range.anchor.path.join('.')}:${range.anchor.offset}-${range.focus.path.join('.')}:${range.focus.offset}`;
}
