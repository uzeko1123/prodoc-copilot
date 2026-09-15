'use client';

import { Input } from '@/components/shadcn/ui/input';
import { FindReplacePlugin } from '@platejs/find-replace';
import { useEditorPlugin, usePluginOption } from 'platejs/react';

export function Find() {
  const { editor, setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');

  return (
    <Input
      value={search}
      onChange={(e) => {
        setOption('search', e.target.value);
        editor.api.redecorate();
      }}
      placeholder="Search the text..."
      type="search"
    />
  );
}
