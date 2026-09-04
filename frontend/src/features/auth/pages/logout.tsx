import { FormPageTemplate } from '../components/form-page-template';
import { LogoutInfo } from '../components/logout-info';
import { createFileRoute } from '@tanstack/react-router';

function LogoutPage() {
  return (
    <FormPageTemplate>
      <LogoutInfo />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/logout')({
  component: LogoutPage,
});
