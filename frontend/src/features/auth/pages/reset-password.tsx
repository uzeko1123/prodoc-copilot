import { createFileRoute } from '@tanstack/react-router';
import { FormPageTemplate } from '../components/form-page-template';
import { ResetPasswordForm } from '../components/reset-password-form';

export const Route = createFileRoute('/account/reset-password')({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  return (
    <FormPageTemplate>
      <ResetPasswordForm />
    </FormPageTemplate>
  );
}
