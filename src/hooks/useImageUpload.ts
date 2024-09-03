import axios, { AxiosProgressEvent } from "axios";
import { useState } from "react";

const useUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitStatus, setSubmitStatus] = useState<
    "waiting" | "uploading" | "failed"
  >("waiting");

  const onUploadProgress = (event: AxiosProgressEvent) => {
    const percentCompleted = Math.round(
      (event.loaded * 100) / (event.total || 100)
    );
    setUploadProgress(percentCompleted);
  };

  const uploadFile = async (file: File, calendarId: string) => {
    const data = new FormData();
    data.append("file", file);
    const token = process.env.NEXT_PUBLIC_STORAGE_TOKEN;
    setSubmitStatus("uploading");

    try {
      await axios.put(
        `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net/images/${calendarId}/${file.name}?${token}`,
        file,
        {
          onUploadProgress,
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type,
          },
        }
      );

      setSubmitStatus("waiting");

      return `https://${process.env.NEXT_PUBLIC_STORAGE_ACCOUNT}.blob.core.windows.net/images/${file.name}?${token}`;
    } catch (error) {
      setSubmitStatus("failed");
    } finally {
      console.log("Upload complete");
    }
  };

  return { uploadFile, uploadProgress, submitStatus };
};

export default useUpload;
