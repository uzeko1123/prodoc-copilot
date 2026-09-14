'use client';

import { TogglePlugin } from '@platejs/toggle/react';

import { IndentKit } from '@/components/shadcn/editor/plugins/indent-kit';
import { ToggleElement } from '@/components/shadcn/ui/toggle-node';

export const ToggleKit = [
  ...IndentKit,
  TogglePlugin.withComponent(ToggleElement),
];
