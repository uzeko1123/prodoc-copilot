import { ChangePasswordForm } from '../components/change-password-form';
import { FormPageTemplate } from '../components/form-page-template';
import { createFileRoute } from '@tanstack/react-router';

function ChangePasswordPage() {
  return (
    <FormPageTemplate>
      <ChangePasswordForm />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/change-password')({
  component: ChangePasswordPage,
});
