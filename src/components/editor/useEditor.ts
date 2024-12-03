"use client";
import { useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import ExtensionKit from "@/extensions/extension-kit";

declare global {
  interface Window {
    editor: Editor | null;
  }
}

interface TextEditorProps {
  content: string;
  onUpdateContent: (content: string) => void;
}

export const useTextEditor = ({
  content,
  onUpdateContent,
}: TextEditorProps) => {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    autofocus: true,
    content,
    onUpdate: ({ editor }) => {
      onUpdateContent(editor.getHTML());
    },
    extensions: ExtensionKit,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "min-h-full",
      },
    },
  });

  return { editor };
};
