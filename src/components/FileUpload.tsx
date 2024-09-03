import useUpload from "@/hooks/useImageUpload";
import { Button } from "@tremor/react";
import { on } from "events";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Resizer from "react-image-file-resizer";

interface FileUploadProps {
  calendarId: string;
  file: File;
  onCompleted?: (url: string) => void;
}

const FileUpload = ({ file, onCompleted, calendarId }: FileUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { uploadFile, submitStatus, uploadProgress } = useUpload();

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = async () => {
      setPreviewUrl(reader.result as string);
      await resizeFile(file);
    };

    reader.readAsDataURL(file);
  }, [file]);

  const handleUpload = async () => {
    if (file) {
      const url = await uploadFile(file, calendarId);
      onCompleted && url && onCompleted(url);
    }
  };

  const resizeFile = (file: Blob) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        600,
        600,
        "JPEG",
        100,
        0,
        (uri) => {
          resolve(uri);
        },
        "base64"
      );
    });

  return (
    <div className="flex flex-col justify-start items-start gap-2">
      {previewUrl && (
        <Image src={previewUrl} alt="Preview" width={800} height={600} />
      )}
      {submitStatus === "waiting" ? (
        <Button onClick={handleUpload}>Upload</Button>
      ) : submitStatus === "uploading" ? (
        <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-600">
          <div
            className="h-5 bg-blue-600"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      ) : (
        <span>Upload failed</span>
      )}
    </div>
  );
};

export default FileUpload;
