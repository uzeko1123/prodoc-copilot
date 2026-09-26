import { getAuthUserRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { queryClient } from '@/lib/query-client';
import { noop } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { FormPageTemplate } from '../components/form-page-template';
import { UserInfo } from '../components/user-info';

function IndexPage() {
  return (
    <FormPageTemplate>
      <UserInfo />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/')({
  beforeLoad: () => {
    void queryClient.query(getAuthUserRetrieveQueryOptions()).catch(noop);
  },
  component: IndexPage,
});
