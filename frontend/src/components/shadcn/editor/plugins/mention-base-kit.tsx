import { BaseMentionPlugin } from '@platejs/mention';

import { MentionElementStatic } from '@/components/shadcn/ui/mention-node-static';

export const BaseMentionKit = [
  BaseMentionPlugin.withComponent(MentionElementStatic),
];
