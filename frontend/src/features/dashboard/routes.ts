import { index, route } from '@tanstack/virtual-file-routes';

export const dashboardRoutes = [
  index('features/dashboard/pages/index.tsx'),
  route('/task/edit', 'features/dashboard/pages/task-edit.tsx'),
  route('/task/review', 'features/dashboard/pages/task-review.tsx'),
];
