import { createFileRoute } from '@tanstack/react-router';
import { Chat } from '../components/chat';

function IndexPage() {
  return <Chat />;
}

export const Route = createFileRoute('/chat/')({
  component: IndexPage,
});
