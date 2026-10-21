import { index, route } from '@tanstack/virtual-file-routes';

export const dashboardRoutes = [
  index('features/dashboard/pages/index.tsx'),
  route('/task/edit', 'features/task/pages/task-edit.tsx'),
  route('/task/review', 'features/task/pages/task-review.tsx'),
];
