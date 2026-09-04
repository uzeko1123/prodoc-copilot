import { Editor } from '../components/editor';
import { createFileRoute } from '@tanstack/react-router';

function IndexPage() {
  return <Editor />;
}

export const Route = createFileRoute('/editor/')({
  component: IndexPage,
});
