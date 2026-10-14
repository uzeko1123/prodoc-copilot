'use client';

import { mainDocumentsPartialUpdate } from '@/api/gen/endpoints/main/main';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { toastErrorMessage } from '@/lib/error-message';
import { MarkdownPlugin } from '@platejs/markdown';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { CloudUploadIcon, SaveIcon } from 'lucide-react';
import {
  useEditorReadOnly,
  useEditorRef,
  useEditorValue,
  usePluginOption,
} from 'platejs/react';
import * as React from 'react';
import { toast } from 'sonner';
import { DocumentPlugin } from '../editor/plugins/document-kit';
import {
  ImageFileIcon,
  MarkdownFileIcon,
  PdfFileIcon,
  WordFileIcon,
} from './file-icons';

export function ExportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const value = useEditorValue();
  const readOnly = useEditorReadOnly();
  const documentId = usePluginOption(DocumentPlugin, 'documentId');

  const [open, setOpen] = React.useState(false);

  const getCanvas = async () => {
    const { default: html2canvas } = await import('html2canvas-pro');

    const canvas = await html2canvas(editor.api.toDOMNode(editor)!, {
      onclone: (_document: Document, element: HTMLElement) => {
        element.style.height = `${element.scrollHeight}px`;
      },
    });

    return canvas;
  };

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url);

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();

    // Clean up the blob URL
    window.URL.revokeObjectURL(blobUrl);
  };

  const exportToImage = async () => {
    const canvas = await getCanvas();
    await downloadFile(canvas.toDataURL('image/png'), 'ProDoc.png');
  };

  const exportToMarkdown = async () => {
    const md = editor.getApi(MarkdownPlugin).markdown.serialize();
    const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`;
    await downloadFile(url, 'ProDoc.md');
  };

  const syncToBackend = async () => {
    if (!documentId) return;
    await mainDocumentsPartialUpdate(documentId, { value })
      .then(() => toast.success('已保存至云端'))
      .catch(toastErrorMessage);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="导出" isDropdown>
          <SaveIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto" align="start">
        <DropdownMenuGroup>
          {!readOnly && (
            <>
              <DropdownMenuItem disabled={readOnly} onSelect={syncToBackend}>
                <CloudUploadIcon /> 保存至云端
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onSelect={exportToMarkdown}>
            <MarkdownFileIcon /> 导出为 Markdown
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <WordFileIcon /> 导出为 Word
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <PdfFileIcon /> 导出为 PDF
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={exportToImage}>
            <ImageFileIcon /> 导出为图片
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
