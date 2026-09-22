'use client';

import { BlockSelection } from '@/components/shadcn/ui/block-selection';
import { aiChatPlugin } from '@/features/chat/components/editor/plugins/ai-kit';
import { AIChatPlugin } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { getPluginTypes, isHotkey, KEYS } from 'platejs';

export const hasSelectableClass = ({
  attributes,
  className,
}: {
  attributes: { className?: string };
  className?: string;
}) =>
  [className, attributes.className]
    .filter(Boolean)
    .join(' ')
    .includes('slate-selectable');

export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    editOnly: false,
    options: {
      enableContextMenu: true,
      isSelectable: (element) =>
        !getPluginTypes(editor, [KEYS.column, KEYS.codeLine, KEYS.td]).includes(
          element.type,
        ),
      onKeyDownSelecting: (editor, e) => {
        if (isHotkey(aiChatPlugin.shortcuts.show?.keys)(e)) {
          e.preventDefault();
          editor.getApi(AIChatPlugin).aiChat.show();
        }
      },
    },
    render: {
      belowRootNodes: (props) => {
        if (!hasSelectableClass(props)) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <BlockSelection {...(props as any)} />;
      },
    },
  })),
];
