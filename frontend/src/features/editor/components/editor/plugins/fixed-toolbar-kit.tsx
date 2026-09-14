'use client';

import { FixedToolbar } from '@/components/shadcn/ui/fixed-toolbar';
import { createPlatePlugin } from 'platejs/react';
import { FixedToolbarButtons } from '../../ui/fixed-toolbar-buttons';

export const FixedToolbarKit = [
  createPlatePlugin({
    key: 'fixed-toolbar',
    render: {
      beforeEditable: () => (
        <FixedToolbar className='h-10 min-h-10 max-h-10'>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
