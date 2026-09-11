import { Button } from '@/components/tiptap/ui-primitive/button';
import { Spacer } from '@/components/tiptap/ui-primitive/spacer';
import {
  Toolbar as Toolbar_,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap/ui-primitive/toolbar';
import { BlockquoteButton } from '@/components/tiptap/ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap/ui/code-block-button';
import { ColorHighlightPopover } from '@/components/tiptap/ui/color-highlight-popover';
import { HeadingDropdownMenu } from '@/components/tiptap/ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap/ui/image-upload-button';
import { LinkPopover } from '@/components/tiptap/ui/link-popover';
import { ListDropdownMenu } from '@/components/tiptap/ui/list-dropdown-menu';
import { MarkButton } from '@/components/tiptap/ui/mark-button';
import { SearchAndReplaceButton } from '@/components/tiptap/ui/search-and-replace';
import { TextAlignButton } from '@/components/tiptap/ui/text-align-button';
import { UndoRedoButton } from '@/components/tiptap/ui/undo-redo-button';
import { PanelLeftIcon } from 'lucide-react';

export function Toolbar({
  searchAndReplaceButtonRef,
  onSearchAndReplaceButtonClick,
  isSearchAndReplaceOpen,
  tocButtonRef,
  onTocButtonClick,
  isTocPanelOpen,
}: {
  searchAndReplaceButtonRef: React.RefObject<HTMLButtonElement | null>;
  onSearchAndReplaceButtonClick: () => void;
  isSearchAndReplaceOpen: boolean;
  tocButtonRef: React.RefObject<HTMLButtonElement | null>;
  onTocButtonClick: () => void;
  isTocPanelOpen: boolean;
}) {
  return (
    <Toolbar_>
      {!isTocPanelOpen && (
        <>
          <ToolbarGroup>
            <Button
              type="button"
              variant="ghost"
              role="button"
              tabIndex={-1}
              aria-label="Table of contents"
              tooltip="Table of contents"
              ref={tocButtonRef}
              aria-expanded={isTocPanelOpen}
              data-active-state={isTocPanelOpen ? 'on' : 'off'}
              onClick={onTocButtonClick}
            >
              <PanelLeftIcon className="tiptap-button-icon" />
            </Button>
          </ToolbarGroup>
          <ToolbarSeparator />
        </>
      )}

      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu
          modal={false}
          types={['bulletList', 'orderedList', 'taskList']}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        <ColorHighlightPopover />
        <LinkPopover />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="Add" />
      </ToolbarGroup>

      <Spacer />
      <ToolbarSeparator />

      <ToolbarGroup>
        <SearchAndReplaceButton
          ref={searchAndReplaceButtonRef}
          aria-expanded={isSearchAndReplaceOpen}
          data-active-state={isSearchAndReplaceOpen ? 'on' : 'off'}
          onClick={onSearchAndReplaceButtonClick}
        />
      </ToolbarGroup>
    </Toolbar_>
  );
}
