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
import Image from "next/image";

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
  width?: number;
  height?: number;
  showLabel?: boolean;
}

const PostCard = ({
  content,
  style,
  onUpdateContent,
  fileUrl,
  editable = false,
  onAddImageClicked,
  onImageClicked,
  color = "#FF00FF",
  onClick,
  width,
  height,
  showLabel,
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

  const wrapperStyle = {
    width,
    height,
    ...style,
  };

  return (
    <div
      style={wrapperStyle}
      onClick={onWrapperClick}
      className={`bg-gradient-to-b  rounded-l-lg shadow-lg flex flex-col align-top bg-white ${
        editable && "outline-1 outline-black outline"
      }`}
    >
      {!hasFile ? (
        <div className="flex items-center flex-1 relative p-4 justify-center pointer-events-auto bg-white">
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
        <div className="flex-1 relative">
          {fileUrl.includes("mov") || fileUrl.includes("mp4") ? (
            <video
              className="object-cover object-left-top"
              src={fileUrl}
            ></video>
          ) : (
            fileUrl && (
              <Image
                layout="fill"
                alt="post-card"
                className="object-cover object-left-top"
                src={fileUrl}
              />
            )
          )}
          {editable && (
            <RiImageAddLine
              className="absolute right-0 top-0 flex items-center p-2 text-white justify-center bg-black cursor-pointer"
              onClick={onAddImageClicked}
            />
          )}
          {!editable && (
            <RiCameraLensFill
              data-no-dnd="true"
              className="absolute right-0 top-0 flex items-center  p-2 text-black justify-center cursor-pointer"
              onClick={onImageClicked}
            />
          )}
        </div>
      )}
      {showLabel && (
        <div
          className="flex-1 p-2"
          style={{
            backgroundColor: `${hexConvert(color, 0.8)}`,
          }}
        >
          <ContentEditable
            className="whitespace-normal outline-none bg-transparent"
            innerRef={editRef}
            tagName="pre"
            disabled={!editable} // use true to disable edition
            html={content || ""} // innerHTML of the editable div
            onChange={(e) => onUpdateContent && onUpdateContent(e.target.value)} // handle innerHTML change
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
