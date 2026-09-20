import { withAIBatch } from '@platejs/ai';
import { AIChatPlugin, streamInsertChunk } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { BaseSuggestionPlugin, getSuggestionKey } from '@platejs/suggestion';
import { KEYS, nanoid, TextApi, type TSuggestionData } from 'platejs';
import type { PlateEditor } from 'platejs/react';

/** Suggestion data extended with the AI-generated marker. */
type AISuggestionData = TSuggestionData & { isAI?: boolean };

// The revision being streamed. Recreated on the first chunk of each tool
// call so every chunk lands as part of a single reviewable revision. For
// `replace` streams the same id also covers the 'remove' half (the
// struck-through original), giving an atomic replace revision — one
// accept/reject for both halves.
let currentRevision: AISuggestionData | null = null;

// Prefix of the content already streamed by the edit primitive (it receives
// the full content on every call, unlike generate which gets the delta).
let editApplied = '';

function streamRevision(
  editor: PlateEditor,
  chunk: string,
  isFirst: boolean,
  { replace }: { replace: boolean },
) {
  if (isFirst) {
    currentRevision = {
      createdAt: Date.now(),
      id: nanoid(),
      isAI: true,
      type: 'insert',
      userId: editor.getOption(BaseSuggestionPlugin, 'currentUserId')!,
    };

    // Reset the streamInsertChunk cursor so consecutive tool calls in one
    // message don't continue the previous insertion.
    editor.setOption(AIChatPlugin, '_blockPath', null);
    editor.setOption(AIChatPlugin, '_blockChunks', '');
    editor.setOption(AIChatPlugin, 'streaming', true);

    const blocks = editor
      .getApi(BlockSelectionPlugin)
      .blockSelection.getNodes();
    const range =
      blocks.length > 0 ? editor.api.nodesRange(blocks) : editor.selection;

    if (!range) return;

    if (replace && !editor.api.isCollapsed(range)) {
      const data = currentRevision;

      // Collapse to the range start so the insertion lands right before the
      // struck-through original (native suggest-mode replace position).
      editor.tf.select(range.anchor);

      // Mark the original text as removed, sharing the revision id.
      withAIBatch(editor, () => {
        editor.tf.setNodes(
          {
            [getSuggestionKey(data.id)]: { ...data, type: 'remove' },
            [KEYS.suggestion]: true,
          },
          {
            at: range,
            match: TextApi.isText,
            split: true,
          },
        );
      });
    } else if (!editor.selection) {
      // In block-selection mode there is no editor.selection. Select the end
      // of the last selected block so the insertion lands below it.
      const lastBlock = blocks.at(-1);

      if (lastBlock) {
        editor.tf.select(editor.api.end(lastBlock[1]));
      }
    } else {
      // Insert after the cursor or selection.
      editor.tf.select(editor.api.end(range));
    }
  }

  if (chunk.length === 0) return;

  const data = currentRevision;
  if (!data) return;

  withAIBatch(
    editor,
    () => {
      if (!editor.getOption(AIChatPlugin, 'streaming')) return;

      editor.tf.withScrolling(() => {
        streamInsertChunk(editor, chunk, {
          textProps: {
            [getSuggestionKey(data.id)]: data,
            [KEYS.suggestion]: true,
          },
        });
      });
    },
    { split: isFirst },
  );
}

/**
 * Edit primitive: strikes the selected range through ('remove' half) and
 * streams the growing content before it ('insert' half), both under one
 * suggestion id. Receives the full content; tracks the streamed prefix.
 */
export function applyEditSuggestion(
  editor: PlateEditor,
  isFirst: boolean,
  content: string,
) {
  let prev = isFirst ? '' : editApplied;
  if (!content.startsWith(prev)) prev = '';
  editApplied = content;

  streamRevision(editor, content.slice(prev.length), isFirst, {
    replace: true,
  });
}

/**
 * Generate primitive: streams the chunk after the cursor or selected range
 * as a single insert revision.
 */
export function applyGenerateSuggestion(
  editor: PlateEditor,
  chunk: string,
  isFirst: boolean,
) {
  streamRevision(editor, chunk, isFirst, { replace: false });
}

export function resetSuggestionStream() {
  currentRevision = null;
  editApplied = '';
}
