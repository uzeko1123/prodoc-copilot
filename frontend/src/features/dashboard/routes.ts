import { index, route } from '@tanstack/virtual-file-routes';

export const dashboardRoutes = [
  index('features/dashboard/pages/index.tsx'),
  route('/null', 'features/dashboard/pages/null.tsx'),
];
