"use client";
import { useEffect, useRef, RefObject, CSSProperties } from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import hexConvert from "hex-color-opacity";

export interface NoteProps {
  content?: string;
  onUpdateContent?: (val: string) => void;
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
}: NoteProps) => {
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;

  const onChange = (e: ContentEditableEvent) => {
    if (e.target.value !== content) {
      onUpdateContent && onUpdateContent(e.target.value);
    }
  };

  useEffect(() => {
    if (!editable) {
      const editor = editRef.current;
      if (editor) editor.scrollTop = 0;
    }
  }, [editable]);

  return (
    <div
      className={`text-xl md:text-2xl touch-none relative flex flex-col text-gray-800 rounded-3xl p-4 pb-1 flex-shrink-0`}
      style={{
        backgroundColor: `${hexConvert(color, 0.8)}`,
        width: "10em",
        height: "10em",
        ...style,
      }}
    >
      <ContentEditable
        innerRef={editRef}
        className="resize-none bg-transparent border-none outline-none whitespace-pre-wrap max-h-full overflow-y-auto "
        tagName="div"
        html={content || ""} // innerHTML of the editable div
        disabled={!editable} // use true to disable edition
        onChange={onChange} // handle innerHTML change
      />
    </div>
  );
};

export default Note;
