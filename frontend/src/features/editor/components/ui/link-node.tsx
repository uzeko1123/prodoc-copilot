'use client';

// import * as React from 'react';
import { inlineSuggestionVariants } from '@/lib/shadcn/suggestion';
import { getLinkAttributes } from '@platejs/link';
import { cn } from 'cn';
import type { TLinkElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';
import { PlateElement } from 'platejs/react';

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  return (
    <PlateElement
      {...props}
      as="a"
      className={cn(
        'text-primary decoration-primary font-medium underline underline-offset-4',
        inlineSuggestionVariants(),
      )}
      attributes={{
        ...props.attributes,
        ...getLinkAttributes(props.editor, props.element),
        onMouseOver: (e) => {
          e.stopPropagation();
        },
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      }}
    >
      {props.children}
    </PlateElement>
  );
}
