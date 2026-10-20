import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { FormPageTemplate } from '../components/form-page-template';
import { VerifyEmailInfo } from '../components/verify-email-info';

export const Route = createFileRoute('/account/verify-email')({
  validateSearch: z.object({ key: z.string() }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { key } = Route.useSearch();
  return (
    <FormPageTemplate>
      <VerifyEmailInfo key_={key} />
    </FormPageTemplate>
  );
}
