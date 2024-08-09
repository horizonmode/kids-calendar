import React, {
  CSSProperties,
  FocusEventHandler,
  FocusEvent,
  ReactNode,
  useRef,
  useState,
  RefObject,
} from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
// import RotateIcon from "./RotateIcon";

export interface TextProps {
  content?: string;
  onUpdateContent?: (val: string) => void;
  color?: string;
  onChangeColor?: (val: string) => void;
  onSelect?: () => void;
  style?: CSSProperties;
  onDelete?: () => void;
  children?: ReactNode;
}

const Text = ({
  content,
  style,
  onUpdateContent,
  onSelect,
  onDelete,
  children,
  color,
  onChangeColor,
}: TextProps) => {
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;
  const [editable, setEditable] = useState(false);
  const onChange = (e: ContentEditableEvent) => {
    if (e.target.value !== content) {
      onUpdateContent && onUpdateContent(e.target.value);
    }
  };

  const onBlur: FocusEventHandler = (event: FocusEvent) => {
    const editor = editRef.current;
    if (editor) editor.scrollTop = 0;
    if (
      !event.relatedTarget ||
      !event.relatedTarget?.attributes ||
      event.relatedTarget.attributes.getNamedItem("name")?.value !== "color"
    ) {
      setEditable(false);
    }

    if (content === "") {
      onDelete && onDelete();
    }
  };

  return (
    <div
      className="overflow-visible touch-manipulation font-extralight"
      style={{ ...style }}
    >
      <div
        className="p-[0.2rem]"
        style={{
          color: color,
        }}
      >
        {/* {editable && showRotate && (
          <div
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={s.rotateIcon}
          >
            <RotateIcon dragOverlay={true} top={0} left={0} id={id} />
          </div>
        )} */}

        <ContentEditable
          innerRef={editRef}
          onClick={(e) => {
            e.stopPropagation();
            setEditable(true);
            onSelect && onSelect();
          }}
          className="bg-inherit tracking-tight text-[1.5rem] leading-[2rem] whitespace-pre-line max-h-full overflow-hidden w-max max-w-[12rem] rotate-[350deg] origin-top-right outline-none"
          tagName="div"
          html={content || ""} // innerHTML of the editable div
          //disabled={!this.state.editable} // use true to disable edition
          onChange={onChange} // handle innerHTML change
          onBlur={onBlur}
        />
        {editable && (
          <>
            <div
              id="dateAndEdit"
              className="bottom-4 flex items-center mt-auto mb-2 justify-between"
            >
              <input
                className="absolute -left-2 -bottom-16"
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
            </div>
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete && onDelete();
              }}
              className="absolute right-[-1.5rem] top-[-1.5rem] z-10 h-[2em] w-[2em] bg-[url('../assets/close.png')] bg-contain bg-no-repeat"
            ></div>
          </>
        )}
        {children}
      </div>
    </div>
  );
};

export default Text;
