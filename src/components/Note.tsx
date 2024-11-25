"use client";
import { CSSProperties } from "react";
import hexConvert from "hex-color-opacity";
import { Resizable } from "re-resizable";
import { EditorProvider } from "@tiptap/react";
import ExtensionKit from "@/extensions/extension-kit";
import { TextMenuProvider } from "./editor/TextMenu";

export interface NoteProps {
  content?: string;
  onUpdateContent?: (val: string) => void;
  onUpdateSize?: (width: number, height: number) => void;
  onClick?: () => void;
  onBlur?: () => void;
  color?: string;
  style?: CSSProperties;
  editable: boolean;
  width: number;
  height: number;
}

const Note = ({
  content,
  onUpdateContent,
  onClick,
  color = "#0096FF",
  style,
  editable,
  onBlur,
  width,
  height,
  onUpdateSize,
}: NoteProps) => {
  const isHex = /^#[0-9A-F]{6}$/i.test(color);
  if (isHex) {
    color = hexConvert(color, !editable ? 0.8 : 1);
  }

  const text = color === "black" ? "white" : "black";

  const wrapperClass =
    "relative text-sm md:text-md touch-none text-gray-800 p-3 rounded shadow-lg group overflow-y-auto select-none outline-none flex flex-col";

  const wrapperStyle = {
    backgroundColor: color,
    color: text,
    width,
    height,
    ...style,
  };

  const onWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    !editable && onClick && onClick();
  };

  const editableNote = (
    <EditorProvider
      editable={editable}
      slotBefore={editable && <TextMenuProvider />}
      extensions={ExtensionKit}
      content={content}
      onUpdate={(e) => onUpdateContent && onUpdateContent(e.editor.getHTML())}
      immediatelyRender={false}
    />
  );
  return editable ? (
    <Resizable
      defaultSize={{
        width,
        height,
      }}
      className={wrapperClass}
      style={{
        ...wrapperStyle,
        outlineColor: "#000",
        outlineStyle: "solid",
        outlineWidth: "1px",
      }}
      onResizeStop={(e, direction, ref, d) => {
        onUpdateSize && onUpdateSize(ref.offsetWidth, ref.offsetHeight);
      }}
    >
      {editableNote}
    </Resizable>
  ) : (
    <div onClick={onWrapperClick} className={wrapperClass} style={wrapperStyle}>
      {editableNote}
    </div>
  );
};

export default Note;
