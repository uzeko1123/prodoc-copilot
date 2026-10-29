import type { Guide } from '@/api/gen/models';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GuideContent } from './guide-content';

export function GuideDialog({
  guide,
  open,
  onOpenChange,
}: {
  guide: Guide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{guide.name}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto rounded-lg border">
          <GuideContent value={guide.value} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
