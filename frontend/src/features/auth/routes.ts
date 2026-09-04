import { route, index } from '@tanstack/virtual-file-routes';

export const authRoutes = route('/account', [
  index('features/auth/pages/index.tsx'),
  route('/login', 'features/auth/pages/login.tsx'),
  route('/logout', 'features/auth/pages/logout.tsx'),
  route('/signup', 'features/auth/pages/signup.tsx'),
  route('/change-password', 'features/auth/pages/change-password.tsx'),
  route('/reset-password', 'features/auth/pages/reset-password.tsx'),
  route(
    '/reset-password-confirm',
    'features/auth/pages/reset-password-confirm.tsx',
  ),
  route('/verify-email', 'features/auth/pages/verify-email.tsx'),
  route('/resend-email', 'features/auth/pages/resend-email.tsx'),
]);
