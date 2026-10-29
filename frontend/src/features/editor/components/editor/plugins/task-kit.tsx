'use client';

import { createPlatePlugin } from 'platejs/react';

export const TaskPlugin = createPlatePlugin({
  key: 'task',
  options: {
    canEdit: false,
    canComment: false,
  },
});

export const TaskKit = [TaskPlugin];
