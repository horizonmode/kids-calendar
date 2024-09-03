import useImageContext from "@/store/images";
import Image from "next/image";
import React, { DragEventHandler, useState } from "react";
import { shallow } from "zustand/shallow";

interface Image {
  id: string;
  url: string;
}

interface DropZoneProps {
  onDropped: (file: File) => void;
}

const DropZone = ({ onDropped }: DropZoneProps) => {
  const [hovering, setHovering] = useState<boolean>(false);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    onDropped(files[0]);
  };

  const onDragFinished: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setHovering(false);
  };

  const onDragstart: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    setHovering(true);
  };

  const openFilePicker = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files) return;
      const files = Array.from(target.files);
      onDropped(files[0]);
    };
    fileInput.click();
  };

  return (
    <div
      onClick={() => openFilePicker()}
      onDrop={handleDrop}
      onDragOver={onDragstart}
      onDragEnd={onDragFinished}
      onDragExit={onDragFinished}
      onDragLeave={onDragFinished}
      className={`${
        hovering && "bg-slate-200"
      } w-full border-2 border-dashed border-gray-200 flex justify-center items-center aspect-video`}
    >
      <span>Click or Drag and drop images here</span>
    </div>
  );
};

export default DropZone;
