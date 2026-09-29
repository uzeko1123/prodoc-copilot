import { cva } from 'class-variance-authority';

export const inlineSuggestionVariants = cva(
  'in-data-[inline-suggestion=insert]:text-blue-900! in-data-[inline-suggestion=remove]:text-red-900! data-[inline-suggestion=insert]:text-blue-900! data-[inline-suggestion=remove]:text-red-900!',
);
