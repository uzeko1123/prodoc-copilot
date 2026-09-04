import { Chat } from '../components/chat';
import { createFileRoute } from '@tanstack/react-router';

function IndexPage() {
  return <Chat />;
}

export const Route = createFileRoute('/chat/')({
  component: IndexPage,
});
