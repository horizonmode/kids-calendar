"use client";
import React, {
  useRef,
  useEffect,
  CSSProperties,
  ReactNode,
  RefObject,
} from "react";
import ContentEditable from "react-contenteditable";
import hexConvert from "hex-color-opacity";
import { RiCameraLensFill, RiImageAddLine } from "@remixicon/react";

export interface PostCardProps {
  content: string;
  onUpdateContent?: (val: string) => void;
  color?: string;
  style?: CSSProperties;
  fileUrl?: string | null;
  children?: ReactNode;
  editable?: boolean;
  onAddImageClicked?: () => void;
  onImageClicked?: () => void;
  onClick?: () => void;
}

const PostCard = ({
  content,
  style,
  onUpdateContent,
  children,
  fileUrl,
  editable = false,
  onAddImageClicked,
  onImageClicked,
  color = "#FF00FF",
  onClick,
}: PostCardProps) => {
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;

  useEffect(() => {
    if (!editable) {
      const editor = editRef.current;
      if (editor) editor.scrollTop = 0;
    } else {
      editRef.current?.focus();
    }
  }, [editable]);

  const hasFile = !!fileUrl;

  const onWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    !editable && onClick && onClick();
  };

  return (
    <div style={{ ...style }}>
      <div
        onClick={onWrapperClick}
        className={`bg-gradient-to-b  rounded-l-lg shadow-lg w-[10rem] flex flex-col align-top bg-white ${
          editable && "outline-1 outline-black outline"
        }`}
      >
        {!hasFile ? (
          <div className="flex items-center w-full h-full p-6 justify-center pointer-events-auto">
            {editable ? (
              <RiImageAddLine
                onClick={() => {
                  if (onAddImageClicked) {
                    onAddImageClicked();
                  }
                }}
              />
            ) : (
              <RiCameraLensFill />
            )}
          </div>
        ) : (
          <>
            {fileUrl.includes("mov") || fileUrl.includes("mp4") ? (
              <video className="min-w-full h-auto" src={fileUrl}></video>
            ) : (
              fileUrl && (
                <img
                  className="min-w-full h-auto"
                  onClick={onImageClicked}
                  src={fileUrl}
                />
              )
            )}
            {editable && (
              <RiImageAddLine
                className="absolute right-0 top-0 flex items-center w-10 h-10 p-2 text-white justify-center bg-black cursor-pointer"
                onClick={onAddImageClicked}
              />
            )}
            {!editable && (
              <RiCameraLensFill
                data-no-dnd="true"
                className="absolute right-0 top-0 flex items-center w-10 h-10 p-2 text-black justify-center cursor-pointer"
                onClick={onImageClicked}
              />
            )}
          </>
        )}
        <div
          style={{
            backgroundColor: `${hexConvert(color, 0.8)}`,
          }}
        >
          <ContentEditable
            className=" whitespace-normal outline-none p-2 bg-transparent"
            innerRef={editRef}
            tagName="pre"
            disabled={!editable} // use true to disable edition
            html={content || ""} // innerHTML of the editable div
            onChange={(e) => onUpdateContent && onUpdateContent(e.target.value)} // handle innerHTML change
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
