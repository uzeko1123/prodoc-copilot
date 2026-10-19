import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { FormPageTemplate } from '../components/form-page-template';
import { LoginForm } from '../components/login-form';

export const Route = createFileRoute('/account/login')({
  validateSearch: z.object({ redirect: z.string().optional() }).parse,
  component: LoginPage,
});

function LoginPage() {
  const { redirect } = Route.useSearch();
  return (
    <FormPageTemplate>
      <LoginForm redirect={redirect} />
    </FormPageTemplate>
  );
}
