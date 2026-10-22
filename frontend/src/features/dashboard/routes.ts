import { index, route } from '@tanstack/virtual-file-routes';

export const dashboardRoutes = [
  index('features/dashboard/pages/index.tsx'),
  route('/task/create', 'features/task/pages/task-create.tsx'),
  route('/task/review', 'features/task/pages/task-review.tsx'),
];
