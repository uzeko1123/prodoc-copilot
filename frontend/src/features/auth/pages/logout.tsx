import { createFileRoute } from '@tanstack/react-router';
import { FormPageTemplate } from '../components/form-page-template';
import { LogoutInfo } from '../components/logout-info';

export const Route = createFileRoute('/account/logout')({
  component: LogoutPage,
});

function LogoutPage() {
  return (
    <FormPageTemplate>
      <LogoutInfo />
    </FormPageTemplate>
  );
}
