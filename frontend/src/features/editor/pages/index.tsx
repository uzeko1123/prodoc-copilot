import { createFileRoute } from '@tanstack/react-router';
import { Editor } from '../components/editor';

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
