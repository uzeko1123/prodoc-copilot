'use client';

import { SearchHighlightLeaf } from '@/components/shadcn/ui/search-highlight-node';
import { FindReplacePlugin } from '@platejs/find-replace';

export const FindReplaceKit = [
  FindReplacePlugin.configure({
    render: { node: SearchHighlightLeaf },
  }),
];
