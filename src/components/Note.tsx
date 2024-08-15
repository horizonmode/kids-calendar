"use client";
import {
  useEffect,
  useRef,
  RefObject,
  CSSProperties,
  useLayoutEffect,
} from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import hexConvert from "hex-color-opacity";
import { useEditable } from "use-editable";

export interface NoteProps {
  content?: string;
  onUpdateContent?: (val: string) => void;
  onBlur?: () => void;
  color?: string;
  style?: CSSProperties;
  editable: boolean;
}

const Note = ({
  content,
  onUpdateContent,
  color = "#0096FF",
  style,
  editable,
  onBlur,
}: NoteProps) => {
  const editRef: RefObject<HTMLDivElement> =
    useRef<HTMLDivElement>() as RefObject<HTMLDivElement>;

  const onChange = (e: string) => {
    if (e !== content) {
      onUpdateContent && onUpdateContent(e);
    }
  };

  useEditable(editRef, onChange, {
    disabled: !editable,
  });

  const textRef = useRef<string>();

  useEffect(() => {
    textRef.current = content;
  }, [content]);

  useLayoutEffect(() => {
    const editor = editRef.current;
    if (!editor) return;
    if (!editable) {
      editor.scrollTop = 0;
    } else {
      editor.focus();
    }
  }, [editable]);

  const isHex = /^#[0-9A-F]{6}$/i.test(color);
  if (isHex) {
    color = hexConvert(color, 0.8);
  }

  const text = color === "black" ? "white" : "black";

  return (
    <div
      className={`relative text-xl md:text-2xl touch-none flex flex-col text-gray-800 p-3 flex-shrink-0 w-44 max-w-48 max-h-48 h-auto rounded-xl shadow-lg`}
      style={{
        backgroundColor: color,
        color: text,
        ...style,
      }}
    >
      <div
        ref={editRef}
        className="resize-none bg-transparent border-none outline-none overflow-y-auto"
        onBlur={onBlur}
      >
        {content}
      </div>
    </div>
  );
};

export default Note;
