import { Link } from '@tanstack/react-router';
import { PencilSparkles } from 'lucide-react';

export function FormPageTemplate({ children }: React.PropsWithChildren) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <PencilSparkles className="size-5" />
          </div>
          <Link to="/" className="text-lg">
            ProDoc Copilot
          </Link>
          <div className="text-sm">专业文档 AI 助手</div>
        </div>
        {children}
      </div>
    </div>
  );
}
