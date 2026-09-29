'use client';

import { ToolbarButton } from '@/components/shadcn/ui/toolbar';
import { useIndentButton, useOutdentButton } from '@platejs/indent/react';
import { IndentIcon, OutdentIcon } from 'lucide-react';
import * as React from 'react';

export function IndentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>,
) {
  const { props: buttonProps } = useIndentButton();

  return (
    <ToolbarButton {...props} {...buttonProps} tooltip="增加缩进">
      <IndentIcon />
    </ToolbarButton>
  );
}

export function OutdentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>,
) {
  const { props: buttonProps } = useOutdentButton();

  return (
    <ToolbarButton {...props} {...buttonProps} tooltip="减少缩进">
      <OutdentIcon />
    </ToolbarButton>
  );
}
