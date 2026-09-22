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
import { useWorkbenchStore } from '@/stores/workbench';
import { FindReplacePlugin } from '@platejs/find-replace';
import { SearchIcon, SearchXIcon } from 'lucide-react';
import { ElementApi, NodeApi, TextApi, type TNode, type TRange } from 'platejs';
import {
  useEditorPlugin,
  useEditorRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { findAll } from '../lib/find';

export function Find() {
  const editor = useEditorRef();
  const { setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');
  const activeLeftPanelTab = useWorkbenchStore(
    (state) => state.activeLeftPanelTab,
  );

  useEffect(() => {
    if (activeLeftPanelTab === 'find' || !search) return;
    setOption('search', '');
    editor.api.redecorate();
  }, [activeLeftPanelTab, editor, search, setOption]);

  return (
    <div className="flex h-full flex-col">
      <div className="p-2">
        <Input
          value={search}
          onChange={(e) => {
            setOption('search', e.target.value);
            editor.api.redecorate();
          }}
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
  const editorValue = useEditorValue();

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
    flashDomRange(domRange);
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
        {matches.map((match, index) => (
          <Button
            key={index}
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

function flashDomRange(domRange: Range) {
  CSS.highlights.delete('flash-range');
  CSS.highlights.set('flash-range', new Highlight(domRange));

  clearTimeout(flashTimeout);
  flashTimeout = setTimeout(() => {
    CSS.highlights.delete('flash-range');
  }, 1600);
}
