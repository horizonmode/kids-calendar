"use client";
import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  CSSProperties,
  ReactNode,
  RefObject,
} from "react";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import axios, { AxiosProgressEvent } from "axios";
import hexConvert from "hex-color-opacity";
import { RiFileUploadFill } from "@remixicon/react";

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
  content?: string;
  onUpdateContent?: (val: string) => void;
  color?: string;
  style?: CSSProperties;
  fileUrl?: string | null;
  onFileChange?: (val: string | null) => void;
  children?: ReactNode;
  id: string;
  editable?: boolean;
}

const PostCard = ({
  content,
  style,
  onUpdateContent,
  children,
  fileUrl,
  onFileChange,
  id,
  editable = false,
  color = "#FF00FF",
}: PostCardProps) => {
  const editRef: RefObject<HTMLElement> =
    useRef<HTMLElement>() as RefObject<HTMLElement>;
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitStatus, setSubmitStatus] = useState("waiting");
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFileName] = useState<string | null>(null);
  const [editPhoto, setEditPhoto] = useState<boolean>(false);

  const onChange = (e: ContentEditableEvent) => {
    if (e.target.value !== content) {
      onUpdateContent && onUpdateContent(e.target.value);
    }
  };

  const onUploadProgress = (event: AxiosProgressEvent) => {
    const percentCompleted = Math.round(
      (event.loaded * 100) / (event.total || 100)
    );
    setUploadProgress(percentCompleted);
  };

  useEffect(() => {
    if (file) {
      onFileChange && onFileChange("");
      setFileName(file?.name || "");
    }
  }, [file]);

  const uploadFile = useCallback(async (file: File) => {
    const upload = async (file: File) => {
      const data = new FormData();
      data.append("file", file);
      const token = process.env.NEXT_PUBLIC_STORAGE_TOKEN;

      try {
        await axios.put(
          `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net/images/${file.name}?${token}`,
          file,
          {
            onUploadProgress,
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": file.type,
            },
          }
        );

        return `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net/images/${file.name}?${token}`;
      } catch (error) {
        setSubmitStatus("failed");
      } finally {
        console.log("Upload complete");
      }
    };

    return await upload(file);
  }, []);

  const processFile = () => {
    const process = async () => {
      setSubmitting(true);
      if (file) {
        const url = await uploadFile(file);
        setSubmitting(false);
        setEditPhoto(false);
        setFile(null);
        onFileChange && url && onFileChange(url);
      }
    };
    process();
  };

  useEffect(() => {
    if (!editable) {
      const editor = editRef.current;
      if (editor) editor.scrollTop = 0;
    } else {
      editRef.current?.focus();
    }
  }, [editable]);

  return (
    <div style={{ ...style }}>
      <div
        className={`bg-gradient-to-b  rounded-l-lg shadow-lg w-[10rem] flex flex-col align-top bg-white`}
      >
        {fileUrl &&
        !editPhoto &&
        (fileUrl.includes("mov") || fileUrl.includes("mp4")) ? (
          <video className=" min-w-full h-auto" src={fileUrl}></video>
        ) : (
          fileUrl && <img className=" min-w-full h-auto" src={fileUrl} />
        )}
        {!fileUrl && !editPhoto && !editable && (
          <div className="flex items-center w-full h-full p-6 justify-center">
            <RiFileUploadFill />
          </div>
        )}
        {editable && (!fileUrl || editPhoto) && (
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor={`dropzone-file`}
              className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div className="flex flex-col items-center justify-center p-2">
                <RiFileUploadFill />
                {!file ? (
                  <>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      SVG, PNG, JPG or GIF (MAX. 800x400px)
                    </p>
                  </>
                ) : (
                  <p>{filename}</p>
                )}
              </div>
              <input
                id={`dropzone-file`}
                type="file"
                className="hidden"
                name={`dropzone-file-${id}`}
                onChange={(e) =>
                  setFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </label>
          </div>
        )}
        {file && !submitting && (
          <button
            className="m-0 w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none"
            type="submit"
            value="Upload"
            onClick={() => processFile()}
          >
            Upload
          </button>
        )}
        {submitting && (
          <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-600">
            <div
              className="h-5 bg-blue-600"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
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
            onChange={onChange} // handle innerHTML change
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
