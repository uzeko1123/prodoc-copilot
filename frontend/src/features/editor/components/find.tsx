'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { FindReplacePlugin } from '@platejs/find-replace';
import {
  useEditorPlugin,
  useEditorRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import { useMemo } from 'react';
import type { Path, TNode } from 'platejs';
import { findReplace } from '../lib/find-replace';

export function Find() {
  const editor = useEditorRef();
  const editorValue = useEditorValue();
  const { setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');

  const matches = useMemo(() => {
    if (!search) return [];

    type Match = {
      key: string;
      text: string;
      path: Path;
      range: {
        anchor: { path: Path; offset: number };
        focus: { path: Path; offset: number };
      };
    };
    const out: Match[] = [];

    // find 只处理"纯文本叶子元素"（其 children 全是 text 节点），
    // 因此逐 block 调用后仍需递归，以覆盖嵌套结构里的叶子元素。
    const visit = (nodes: TNode[], path: Path) => {
      nodes.forEach((node, i) => {
        const childPath = [...path, i];
        if (!('children' in node)) return; // text 节点跳过

        for (const r of findReplace(node, childPath, search)) {
          out.push({
            // 用 offset 避免同一 text 节点内多个命中重复 key
            key: `${r.anchor.path.join(':')}:${r.anchor.offset}`,
            text: r.search,
            path: r.anchor.path,
            range: { anchor: r.anchor, focus: r.focus },
          });
        }
        visit(node.children as TNode[], childPath);
      });
    };

    visit(editorValue as TNode[], []);
    return out;
  }, [editorValue, search]);

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
        {matches.length === 0 ? (
          <p>No matches found</p>
        ) : (
          matches.map((match) => (
            <Button
              key={match.key}
              variant="outline"
              className="h-auto p-2"
              onClick={() => {
                editor.tf.select(match.range);
                editor.tf.focus({ edge: 'start' });

                const node = editor.api.node(match.path);
                const element = node
                  ? editor.api.toDOMNode(node[0])
                  : undefined;
                element?.scrollIntoView({
                  block: 'center',
                  behavior: 'smooth',
                });
              }}
            >
              <p className="line-clamp-3 w-full text-left whitespace-pre-wrap">
                {match.text}
              </p>
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
