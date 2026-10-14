// @generated-by-ai

import { mainDocumentsPartialUpdate } from '@/api/gen/endpoints/main/main';
import { getDraftCommentKey, getTransientCommentKey } from '@platejs/comment';
import type { Value } from 'platejs';

export function stripCommentMarks(value: Value): Value {
  const draftKey = getDraftCommentKey();
  const transientKey = getTransientCommentKey();
  const clone = JSON.parse(JSON.stringify(value)) as Value;

  const walk = (node: Record<string, unknown>) => {
    delete node[draftKey];
    delete node[transientKey];
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => walk(child as Record<string, unknown>));
    }
  };
  clone.forEach((node) => walk(node as Record<string, unknown>));

  return clone;
}

export function syncEditorValue(documentId: string, value: Value) {
  return mainDocumentsPartialUpdate(documentId, {
    value: stripCommentMarks(value),
  });
}
