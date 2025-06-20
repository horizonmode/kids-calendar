"use client";
import { CSSProperties } from "react";
import hexConvert from "hex-color-opacity";
import { EditorContent, EditorProvider } from "@tiptap/react";
import { TextMenu, TextMenuProvider } from "./editor/TextMenu";
import { ContentItemMenu } from "./editor/ContentItemMenu";
import { useTextEditor } from "./editor/useEditor";

export interface NoteProps {
  content: string;
  onUpdateContent: (val: string) => void;
  onUpdateSize?: (width: number, height: number) => void;
  onClick?: () => void;
  onBlur?: () => void;
  color?: string;
  style?: CSSProperties;
  editable: boolean;
  width: number;
  height: number;
  children?: React.ReactNode;
}

const Note = ({
  content,
  onUpdateContent,
  onClick,
  color = "#0096FF",
  style,
  editable,
  width,
  height,
  children,
}: NoteProps) => {
  const isHex = /^#[0-9A-F]{6}$/i.test(color);
  if (isHex) {
    color = hexConvert(color, !editable ? 0.8 : 1);
  }

  const text = color === "black" ? "white" : "black";

  const wrapperClass =
    "text-sm md:text-md touch-none text-gray-800 p-3 rounded shadow-lg group overflow-y-auto overflow-x-visible select-none outline-none flex flex-col";

  const wrapperStyle = {
    backgroundColor: color,
    color: text,
    width,
    height,
    touchAction: "none",
    ...style,
  };

  const onWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    !editable && onClick && onClick();
  };

  const { editor } = useTextEditor({ onUpdateContent, content, editable });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative touch-none">
      <div
        className={wrapperClass}
        onClick={onWrapperClick}
        style={
          !editable
            ? wrapperStyle
            : {
                ...wrapperStyle,
                outlineColor: "#000",
                outlineStyle: "solid",
                outlineWidth: "1px",
              }
        }
      >
        <EditorContent className="flex-1 overflow-y-auto" editor={editor} />
      </div>
      {editable && (
        <div>
          <TextMenu editor={editor}></TextMenu>
          <ContentItemMenu editor={editor} />
        </div>
      )}
      {children}
    </div>
  );
};

export default Note;
