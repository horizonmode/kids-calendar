import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import { initialContent } from "@/data/initialContent";
import { FontSize } from "@/extensions/FontSize";
import CharacterCount from "@tiptap/extension-character-count";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import StarterKit from "@tiptap/starter-kit";
import { Link } from "@/extensions/Link";

declare global {
  interface Window {
    editor: Editor | null;
  }
}

export const useTextEditor = () => {
  const editor = useEditor({
    immediatelyRender: true,
    shouldRerenderOnTransaction: false,
    autofocus: true,
    onCreate: (ctx) => {
      if (ctx.editor.isEmpty) {
        ctx.editor.commands.setContent(initialContent);
        ctx.editor.commands.focus("start", { scrollIntoView: true });
      }
    },
    extensions: [
      StarterKit.configure(),
      Highlight,
      TaskList,
      TaskItem,
      CharacterCount.configure({
        limit: 10000,
      }),
      TableRow,
      TableHeader,
      FontSize,
      TextStyle,
      Color,
      Link,
    ],
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "min-h-full",
      },
    },
  });

  window.editor = editor;
  return { editor };
};
