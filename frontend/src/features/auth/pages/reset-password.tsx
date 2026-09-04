import { FormPageTemplate } from '../components/form-page-template';
import { ResetPasswordForm } from '../components/reset-password-form';
import { createFileRoute } from '@tanstack/react-router';

function ResetPasswordPage() {
  return (
    <FormPageTemplate>
      <ResetPasswordForm />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/reset-password')({
  component: ResetPasswordPage,
});
