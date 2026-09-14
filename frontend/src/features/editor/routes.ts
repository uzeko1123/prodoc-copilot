import { route, index } from '@tanstack/virtual-file-routes';

export const editorRoutes = route('/editor', [
  index('features/editor/pages/index.tsx'),
]);
