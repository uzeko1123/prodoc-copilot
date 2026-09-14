import { authRoutes } from '@/features/auth/routes';
import { index, rootRoute, route } from '@tanstack/virtual-file-routes';

export const routes = rootRoute('app/root.tsx', [
  index('app/index.tsx'),
  route('/workbench', [index('app/workbench.tsx')]),
  authRoutes,
]);
