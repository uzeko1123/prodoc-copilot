import { FormPageTemplate } from '../components/form-page-template';
import { ResendEmailForm } from '../components/resend-email-form';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

function ResendEmailPage() {
  const { email, resend } = Route.useSearch();
  return (
    <FormPageTemplate>
      <ResendEmailForm email={email} resend={resend} />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/resend-email')({
  validateSearch: z.object({
    email: z.email(),
    resend: z.coerce.boolean().optional(),
  }).parse,
  component: ResendEmailPage,
});
