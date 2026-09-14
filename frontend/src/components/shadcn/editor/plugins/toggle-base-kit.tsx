import { BaseTogglePlugin } from '@platejs/toggle';

import { ToggleElementStatic } from '@/components/shadcn/ui/toggle-node-static';

export const BaseToggleKit = [
  BaseTogglePlugin.withComponent(ToggleElementStatic),
];
