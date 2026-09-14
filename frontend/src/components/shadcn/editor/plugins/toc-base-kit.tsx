import { BaseTocPlugin } from '@platejs/toc';

import { TocElementStatic } from '@/components/shadcn/ui/toc-node-static';

export const BaseTocKit = [BaseTocPlugin.withComponent(TocElementStatic)];
