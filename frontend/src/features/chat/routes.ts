import { route, index } from '@tanstack/virtual-file-routes';

export const chatRoutes = route('/chat', [
  index('features/chat/pages/index.tsx'),
]);
