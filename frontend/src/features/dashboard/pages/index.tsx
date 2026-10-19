import { createFileRoute } from '@tanstack/react-router';

function IndexPage() {
  return null;
}

export const Route = createFileRoute('/dashboard/')({
  component: IndexPage,
  staticData: { headers: ['总览'] },
});
