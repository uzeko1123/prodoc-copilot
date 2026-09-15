'use client';

import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { FindReplacePlugin } from '@platejs/find-replace';
import { useEditorPlugin, usePluginOption } from 'platejs/react';

export function Find() {
  const { editor, setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');

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
        <Button variant="outline" className="h-auto p-2">
          <p className="line-clamp-3 w-full text-left whitespace-pre-wrap">
            Text in SearchHighlightLeaf
          </p>
        </Button>
      </div>
    </div>
  );
}
