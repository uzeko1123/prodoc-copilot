import { cva } from 'class-variance-authority';
import type { TSuggestionData as TSuggestionDataPrimitive } from 'platejs';

export type TSuggestionData = TSuggestionDataPrimitive & {
  createdByAI?: boolean;
};

export const inlineSuggestionVariants = cva(
  'in-data-[inline-suggestion=insert]:text-blue-900! in-data-[inline-suggestion=remove]:text-red-900! data-[inline-suggestion=insert]:text-blue-900! data-[inline-suggestion=remove]:text-red-900!',
);
