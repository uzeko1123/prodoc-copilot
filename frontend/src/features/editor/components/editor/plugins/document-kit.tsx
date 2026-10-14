'use client';

import { createPlatePlugin } from 'platejs/react';

export const DocumentPlugin = createPlatePlugin({
  key: 'document',
  options: {
    documentId: null as string | null,
  },
});

export const DocumentKit = [DocumentPlugin];
