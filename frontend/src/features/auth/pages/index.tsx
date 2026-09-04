import { FormPageTemplate } from '../components/form-page-template';
import { UserInfo } from '../components/user-info';
import { getAuthUserRetrieveQueryOptions } from '@/api/gen/endpoints/auth/auth';
import { queryClient } from '@/lib/query-client';
import { createFileRoute } from '@tanstack/react-router';

function IndexPage() {
  return (
    <FormPageTemplate>
      <UserInfo />
    </FormPageTemplate>
  );
}

export const Route = createFileRoute('/account/')({
  beforeLoad: () => {
    queryClient.fetchQuery(getAuthUserRetrieveQueryOptions());
  },
  component: IndexPage,
});
