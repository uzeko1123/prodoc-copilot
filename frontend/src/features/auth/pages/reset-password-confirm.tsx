import { FormPageTemplate } from '../components/form-page-template';
import { ResetPasswordConfirmForm } from '../components/reset-password-confirm-form';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

function ResetPasswordConfirmPage() {
  const { uid, token } = Route.useSearch();
  return (
    <FormPageTemplate>
      <ResetPasswordConfirmForm uid={uid} token={token} />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/reset-password-confirm')({
  validateSearch: z.object({
    uid: z.coerce.string(),
    token: z.coerce.string(),
  }).parse,
  component: ResetPasswordConfirmPage,
});
