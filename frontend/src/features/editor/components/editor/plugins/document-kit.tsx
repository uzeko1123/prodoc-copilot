'use client';

import { createPlatePlugin } from 'platejs/react';

export const DocumentPlugin = createPlatePlugin({
  key: 'document',
  options: {
    documentId: '',
    canEdit: false,
  },
});

export const DocumentKit = [DocumentPlugin];
