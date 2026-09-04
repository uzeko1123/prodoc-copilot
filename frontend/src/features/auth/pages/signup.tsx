import { FormPageTemplate } from '../components/form-page-template';
import { SignupForm } from '../components/signup-form';
import { createFileRoute } from '@tanstack/react-router';

function SignupPage() {
  return (
    <FormPageTemplate>
      <SignupForm />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/signup')({
  component: SignupPage,
});
