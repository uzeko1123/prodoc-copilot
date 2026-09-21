'use client';

import { FloatingToolbar } from '@/components/shadcn/ui/floating-toolbar';
import { createPlatePlugin } from 'platejs/react';
import { FloatingToolbarButtons } from '../../ui/floating-toolbar-buttons';

export const FloatingToolbarKit = [
  createPlatePlugin({
    key: 'floating-toolbar',
    render: {
      afterEditable: () => (
        <FloatingToolbar>
          <FloatingToolbarButtons />
        </FloatingToolbar>
      ),
    },
  }),
];
