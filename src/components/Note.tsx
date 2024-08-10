"use client";
import {
  FocusEventHandler,
  useEffect,
  useRef,
  useState,
  FocusEvent,
  RefObject,
  CSSProperties,
} from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import hexConvert from "hex-color-opacity";
import closeBtn from "@/assets/close.png";

export interface NoteProps {
  content?: string;
  onUpdateContent?: (val: string) => void;
  color?: string;
  onChangeColor?: (val: string) => void;
  onSelect?: () => void;
  style?: CSSProperties;
  onDelete?: () => void;
}

const Note = ({
  content,
  onUpdateContent,
  color = "#0096FF",
  onChangeColor,
  onSelect,
  style,
  onDelete,
}: NoteProps) => {
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;

  const [editable, setEditable] = useState(false);
  const onChange = (e: ContentEditableEvent) => {
    if (e.target.value !== content) {
      onUpdateContent && onUpdateContent(e.target.value);
    }
  };

  const onBlur: FocusEventHandler = (event: FocusEvent) => {
    if (!event.relatedTarget) {
      setEditable(false);
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
      className={`text-xl md:text-3xl touch-manipulation relative flex flex-col text-gray-800 rounded-3xl p-4 pb-1 flex-shrink-0`}
      style={{
        backgroundColor: `${hexConvert(color, 0.8)}`,
        width: "10em",
        height: "10em",
        boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
        ...style,
      }}
    >
      {editable && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete && onDelete();
          }}
          className={`w-[2em] h-[2em] absolute right-[-1em] top-[-1em] bg-contain bg-no-repeat z-10`}
          style={{
            backgroundImage: `url(${closeBtn.src})`,
          }}
        ></div>
      )}
      <ContentEditable
        innerRef={editRef}
        onClick={(e) => {
          e.stopPropagation();
          setEditable(true);
          onSelect && onSelect();
        }}
        className="resize-none bg-transparent border-none outline-none whitespace-pre-wrap max-h-full overflow-y-auto"
        tagName="div"
        html={content || ""} // innerHTML of the editable div
        //disabled={!this.state.editable} // use true to disable edition
        onChange={onChange} // handle innerHTML change
        onBlur={onBlur}
      />
      <div
        id="dateAndEdit"
        className="bottom-4 flex items-center mt-auto mb-2 justify-between"
      >
        {editable && (
          <input
            className="absolute -left-2 -bottom-12"
            onChange={(e) => {
              const { value } = e.target;
              onChangeColor && onChangeColor(value);
            }}
            type="color"
            id="color"
            name="color"
            value={color}
            onBlur={onBlur}
          />
        )}
      </div>
    </div>
  );
};

export default Note;
