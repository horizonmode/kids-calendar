"use client";

import { AnyExtension } from "@tiptap/react";
import {
  Document,
  CharacterCount,
  Color,
  FontSize,
  Highlight,
  Link,
  StarterKit,
  TextStyle,
  Underline,
  TaskItem,
  TaskList,
  Paragraph,
  Heading,
  HorizontalRule,
  Typography,
  Subscript,
  Superscript,
  Placeholder,
} from ".";

export const ExtensionKit: AnyExtension[] = [
  Document,
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }),
  HorizontalRule,
  StarterKit.configure({
    document: false,
    dropcursor: false,
    heading: false,
    horizontalRule: false,
    blockquote: false,
    history: false,
    codeBlock: false,
  }),
  TextStyle,
  FontSize,
  Color,
  Link.configure({
    openOnClick: false,
  }),
  Highlight.configure({ multicolor: true }),
  Underline,
  CharacterCount.configure({ limit: 50000 }),
  Subscript,
  Superscript,
  Typography,
  Placeholder.configure({
    includeChildren: true,
    showOnlyCurrent: false,
    placeholder: () => "placeholder",
  }),
];

export default ExtensionKit;
