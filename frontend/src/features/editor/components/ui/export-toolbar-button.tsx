'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { MarkdownPlugin } from '@platejs/markdown';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { SaveIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';
import {
  ImageFileIcon,
  MarkdownFileIcon,
  PdfFileIcon,
  WordFileIcon,
} from './file-icons';

export function ExportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
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
    await downloadFile(canvas.toDataURL('image/png'), 'plate.png');
  };

  const exportToMarkdown = async () => {
    const md = editor.getApi(MarkdownPlugin).markdown.serialize();
    const url = `data:text/markdown;charset=utf-8,${encodeURIComponent(md)}`;
    await downloadFile(url, 'ProDoc.md');
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Export" isDropdown>
          <SaveIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={exportToMarkdown}>
            <MarkdownFileIcon /> Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <WordFileIcon /> Export as Word
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <PdfFileIcon /> Export as PDF
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={exportToImage}>
            <ImageFileIcon /> Export as Image
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
