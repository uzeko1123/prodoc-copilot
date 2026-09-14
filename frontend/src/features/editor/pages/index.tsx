import { Editor } from '../components/editor';
import { createFileRoute } from '@tanstack/react-router';

function IndexPage() {
  return (
    <div className="h-screen w-full">
      <Editor />
    </div>
  );
}

export const Route = createFileRoute('/editor/')({
  component: IndexPage,
});
