'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { getColSpan, getRowSpan, getTableGridAbove } from '@platejs/table';
import { TablePlugin, useTableMergeState } from '@platejs/table/react';
import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { cn } from 'cn';
import {
  ArrowDownFromLineIcon,
  ArrowLeftFromLineIcon,
  ArrowRightFromLineIcon,
  ArrowUpFromLineIcon,
  Columns2Icon,
  Grid2x2Icon,
  Grid3x3Icon,
  Rows2Icon,
  TableCellsMergeIcon,
  TableCellsSplitIcon,
  TableIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { useEditorPlugin, useEditorSelector } from 'platejs/react';
import * as React from 'react';

export function TableToolbarButton(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector(
    (editor) => editor.api.some({ match: { type: KEYS.table } }),
    [],
  );

  const { editor, tf } = useEditorPlugin(TablePlugin);
  const [open, setOpen] = React.useState(false);
  const mergeState = useTableMergeState();

  const canSplit = useEditorSelector((editor) => {
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });
    if (cellEntries.length !== 1) return false;
    const cell = cellEntries[0][0];
    return getColSpan(cell) > 1 || getRowSpan(cell) > 1;
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="表格" isDropdown>
          <TableIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex w-auto min-w-0 flex-col"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2 data-disabled:pointer-events-none data-disabled:opacity-50">
              <Grid3x3Icon className="size-4" />
              <span>表格</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="m-0 p-0">
              <TablePicker />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-disabled:pointer-events-none data-disabled:opacity-50"
              disabled={!tableSelected}
            >
              <Grid2x2Icon className="size-4" />
              <span>单元格</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!mergeState.canMerge}
                onSelect={() => {
                  tf.table.merge();
                  editor.tf.focus();
                }}
              >
                <TableCellsMergeIcon />
                合并单元格
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!canSplit}
                onSelect={() => {
                  tf.table.split();
                  editor.tf.focus();
                }}
              >
                <TableCellsSplitIcon />
                拆分单元格
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-disabled:pointer-events-none data-disabled:opacity-50"
              disabled={!tableSelected}
            >
              <Rows2Icon className="size-4" />
              <span>行</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableRow({ before: true });
                  editor.tf.focus();
                }}
              >
                <ArrowUpFromLineIcon />
                在上方插入行
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableRow();
                  editor.tf.focus();
                }}
              >
                <ArrowDownFromLineIcon />
                在下方插入行
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.remove.tableRow();
                  editor.tf.focus();
                }}
              >
                <XIcon />
                删除行
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              className="gap-2 data-disabled:pointer-events-none data-disabled:opacity-50"
              disabled={!tableSelected}
            >
              <Columns2Icon className="size-4" />
              <span>列</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableColumn({ before: true });
                  editor.tf.focus();
                }}
              >
                <ArrowLeftFromLineIcon />
                在左侧插入列
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableColumn();
                  editor.tf.focus();
                }}
              >
                <ArrowRightFromLineIcon />
                在右侧插入列
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-45"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.remove.tableColumn();
                  editor.tf.focus();
                }}
              >
                <XIcon />
                删除列
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="min-w-45"
            disabled={!tableSelected}
            onSelect={() => {
              tf.remove.table();
              editor.tf.focus();
            }}
          >
            <TrashIcon />
            删除表格
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TablePicker() {
  const { editor, tf } = useEditorPlugin(TablePlugin);

  const [tablePicker, setTablePicker] = React.useState({
    grid: Array.from({ length: 8 }, () => Array.from({ length: 8 }).fill(0)),
    size: { colCount: 0, rowCount: 0 },
  });

  const onCellMove = (rowIndex: number, colIndex: number) => {
    const newGrid = [...tablePicker.grid];

    for (let i = 0; i < newGrid.length; i++) {
      for (let j = 0; j < newGrid[i].length; j++) {
        newGrid[i][j] =
          i >= 0 && i <= rowIndex && j >= 0 && j <= colIndex ? 1 : 0;
      }
    }

    setTablePicker({
      grid: newGrid,
      size: { colCount: colIndex + 1, rowCount: rowIndex + 1 },
    });
  };

  return (
    <div
      className="m-0 flex! flex-col p-0"
      onClick={() => {
        tf.insert.table(tablePicker.size, { select: true });
        editor.tf.focus();
      }}
      role="button"
    >
      <div className="grid size-32.5 grid-cols-8 gap-0.5 p-1">
        {tablePicker.grid.map((rows, rowIndex) =>
          rows.map((value, columIndex) => (
            <div
              key={`(${rowIndex},${columIndex})`}
              className={cn(
                'bg-secondary col-span-1 size-3 border border-solid',
                !!value && 'border-current',
              )}
              onMouseMove={() => {
                onCellMove(rowIndex, columIndex);
              }}
            />
          )),
        )}
      </div>

      <div className="text-center text-xs text-current">
        {tablePicker.size.rowCount} x {tablePicker.size.colCount}
      </div>
    </div>
  );
}
