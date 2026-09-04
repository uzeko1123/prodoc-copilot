import { authRoutes } from '@/features/auth/routes';
import { editorRoutes } from '@/features/editor/routes';
import { rootRoute, index } from '@tanstack/virtual-file-routes';

export const routes = rootRoute('app/root.tsx', [
  index('app/index.tsx'),
  authRoutes,
  editorRoutes,
]);
