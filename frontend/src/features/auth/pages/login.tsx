import { createFileRoute } from '@tanstack/react-router';
import { FormPageTemplate } from '../components/form-page-template';
import { LoginForm } from '../components/login-form';

function LoginPage() {
  return (
    <FormPageTemplate>
      <LoginForm />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/login')({
  component: LoginPage,
});
