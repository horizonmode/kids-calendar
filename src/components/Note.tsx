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
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;

  const onChange = (e: ContentEditableEvent) => {
    if (e.target.value !== content) {
      onUpdateContent && onUpdateContent(e.target.value);
    }
  };

  useEffect(() => {
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
      className={`relative text-xl md:text-2xl touch-none flex flex-col text-gray-800 p-3 flex-shrink-0 w-44 max-w-48 max-h-48 h-auto rounded shadow-lg group overflow-hidden select-none`}
      style={{
        backgroundColor: color,
        color: text,
        ...style,
      }}
    >
      <ContentEditable
        innerRef={editRef}
        className="resize-none bg-transparent border-none outline-none overflow-y-auto select-none"
        tagName="div"
        html={content || ""} // innerHTML of the editable div
        disabled={!editable} // use true to disable edition
        onChange={onChange} // handle innerHTML change
        onBlur={onBlur}
      />
    </div>
  );
};

export default Note;
