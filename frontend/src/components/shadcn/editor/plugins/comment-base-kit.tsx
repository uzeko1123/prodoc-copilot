import { BaseCommentPlugin } from '@platejs/comment';

import { CommentLeafStatic } from '@/components/shadcn/ui/comment-node-static';

export const BaseCommentKit = [
  BaseCommentPlugin.withComponent(CommentLeafStatic),
];
