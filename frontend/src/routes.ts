import { authRoutes } from '@/features/auth/routes';
import { index, rootRoute, route } from '@tanstack/virtual-file-routes';
import { dashboardRoutes } from './features/dashboard/routes';

export const routes = rootRoute('app/root.tsx', [
  index('app/index.tsx'),
  route('/account', authRoutes),
  route('/dashboard', 'app/dashboard.tsx', dashboardRoutes),
  route('/workbench/$taskId', [index('app/workbench.tsx')]),
]);
