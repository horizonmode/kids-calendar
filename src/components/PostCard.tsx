"use client";
import React, {
  useRef,
  useEffect,
  CSSProperties,
  ReactNode,
  RefObject,
  useState,
} from "react";
import ContentEditable from "react-contenteditable";
import hexConvert from "hex-color-opacity";
import {
  RiFileUploadFill,
  RiCameraLensFill,
  RiImageAddLine,
} from "@remixicon/react";
import { shallow } from "zustand/shallow";
import useImageContext from "@/store/images";

const PhotoSVG = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    />
  </svg>
);

export interface PostCardProps {
  content: string;
  onUpdateContent: (val: string) => void;
  color?: string;
  style?: CSSProperties;
  fileUrl?: string | null;
  children?: ReactNode;
  editable?: boolean;
  onAddImageClicked?: () => void;
}

const PostCard = ({
  content,
  style,
  onUpdateContent,
  children,
  fileUrl,
  editable = false,
  onAddImageClicked,
  color = "#FF00FF",
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

  return (
    <div style={{ ...style }}>
      <div
        className={`bg-gradient-to-b  rounded-l-lg shadow-lg w-[10rem] flex flex-col align-top bg-white`}
      >
        {!hasFile ? (
          <div className="flex items-center w-full h-full p-6 justify-center">
            {editable ? (
              <RiImageAddLine onClick={onAddImageClicked} />
            ) : (
              <RiCameraLensFill />
            )}
          </div>
        ) : (
          <>
            {fileUrl.includes("mov") || fileUrl.includes("mp4") ? (
              <video className="min-w-full h-auto" src={fileUrl}></video>
            ) : (
              fileUrl && <img className="min-w-full h-auto" src={fileUrl} />
            )}
            {editable && (
              <RiImageAddLine
                className="absolute right-0 top-0 flex items-center w-10 h-10 p-2 text-white justify-center"
                onClick={onAddImageClicked}
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
            className=" whitespace-normal outline-none p-2"
            innerRef={editRef}
            tagName="pre"
            disabled={!editable} // use true to disable edition
            html={content || ""} // innerHTML of the editable div
            onChange={(e) => onUpdateContent(e.target.value)} // handle innerHTML change
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
