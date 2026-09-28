import { BaseAIPlugin, withAIBatch } from '@platejs/ai';
import {
  AIChatPlugin,
  applyAISuggestions,
  getInsertPreviewStart,
  streamInsertChunk,
} from '@platejs/ai/react';
import cloneDeep from 'lodash/cloneDeep.js';
import { ElementApi, getPluginType, KEYS, PathApi } from 'platejs';
import type { PlateEditor } from 'platejs/react';

export function applyEdit(
  editor: PlateEditor,
  isFirst: boolean,
  content: string,
) {
  withAIBatch(
    editor,
    () => {
      applyAISuggestions(editor, content);
    },
    { split: isFirst },
  );
}

export function applyEditPrimitive(
  editor: PlateEditor,
  isFirst: boolean,
  content: string,
) {
  withAIBatch(
    editor,
    () => {
      applyAISuggestions(editor, content);
    },
    { split: isFirst },
  );
}

export function applyGenerate(
  editor: PlateEditor,
  chunk: string,
  isFirst: boolean,
) {
  if (isFirst) {
    const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

    editor.getTransforms(BaseAIPlugin).ai.beginPreview({
      originalBlocks:
        startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
          ? [cloneDeep(startBlock)]
          : [],
    });

    editor.tf.withoutSaving(() => {
      editor.tf.insertNodes(
        {
          children: [{ text: '' }],
          type: getPluginType(editor, KEYS.aiChat),
        },
        {
          at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
        },
      );
    });
    editor.setOption(AIChatPlugin, 'streaming', true);
  }

  if (chunk.length > 0) {
    editor.tf.withoutSaving(() => {
      if (!editor.getOption(AIChatPlugin, 'streaming')) return;

      editor.tf.withScrolling(() => {
        streamInsertChunk(editor, chunk, {
          textProps: {
            [getPluginType(editor, KEYS.ai)]: true,
          },
        });
      });
    });
  }
}

export function applyGeneratePrimitive(
  editor: PlateEditor,
  chunk: string,
  isFirst: boolean,
) {
  if (isFirst) {
    const { startBlock, startInEmptyParagraph } = getInsertPreviewStart(editor);

    editor.getTransforms(BaseAIPlugin).ai.beginPreview({
      originalBlocks:
        startInEmptyParagraph && startBlock && ElementApi.isElement(startBlock)
          ? [cloneDeep(startBlock)]
          : [],
    });

    editor.tf.withoutSaving(() => {
      editor.tf.insertNodes(
        {
          children: [{ text: '' }],
          type: getPluginType(editor, KEYS.aiChat),
        },
        {
          at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
        },
      );
    });
    editor.setOption(AIChatPlugin, 'streaming', true);
  }

  if (chunk.length > 0) {
    editor.tf.withoutSaving(() => {
      if (!editor.getOption(AIChatPlugin, 'streaming')) return;

      editor.tf.withScrolling(() => {
        streamInsertChunk(editor, chunk, {
          textProps: {
            [getPluginType(editor, KEYS.ai)]: true,
          },
        });
      });
    });
  }
}
