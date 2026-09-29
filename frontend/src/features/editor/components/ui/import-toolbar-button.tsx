'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { MarkdownPlugin } from '@platejs/markdown';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { FolderOpenIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import { getEditorDOMFromHtmlString } from 'platejs/static';
import * as React from 'react';
import { useFilePicker } from 'use-file-picker';
import { MarkdownFileIcon, PdfFileIcon, WordFileIcon } from './file-icons';

type ImportType = 'html' | 'markdown';

export function ImportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const getFileNodes = (text: string, type: ImportType) => {
    if (type === 'html') {
      const editorNode = getEditorDOMFromHtmlString(text);
      const nodes = editor.api.html.deserialize({
        element: editorNode,
      });

      return nodes;
    }

    if (type === 'markdown') {
      return editor.getApi(MarkdownPlugin).markdown.deserialize(text);
    }

    return [];
  };

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, 'markdown');

      editor.tf.insertNodes(nodes);
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="导入" isDropdown>
          <FolderOpenIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={openMdFilePicker}>
            <MarkdownFileIcon /> 从 Markdown 导入
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <WordFileIcon /> 从 Word 导入
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <PdfFileIcon /> 从 PDF 导入
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
