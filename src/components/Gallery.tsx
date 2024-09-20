import useImageContext from "@/store/images";
import React, { DragEventHandler, useEffect, useState } from "react";
import { shallow } from "zustand/shallow";
import DropZone from "./DropZone";
import Image from "next/image";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiCheckFill,
  RiDeleteBin2Line,
  RiLoader2Fill,
} from "@remixicon/react";
import { Button } from "@tremor/react";
import FileUpload from "./FileUpload";
import { GalleryImage } from "@/types/Items";
import { deleteImageAction } from "@/serverActions/images";

export interface GalleryProps {
  onImageSelected: (id: GalleryImage) => void;
  selectedImage?: GalleryImage | null;
  calendarId: string;
}

const Gallery = ({
  onImageSelected,
  selectedImage,
  calendarId,
}: GalleryProps) => {
  const [images, addImage, fetchImages] = useImageContext(
    (state) => [state.images, state.addImage, state.fetchImages],
    shallow
  );
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [loadingImageId, setLoadingImageId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 8;

  const onDrop = (file: File) => {
    setFile(file);
  };

  const onImageAdded = (image: { url: string; id: number }) => {
    addImage(image);
    setFile(null);
    setMode("view");
  };

  const onDeleteClicked = async (imageId: number) => {
    const image = images.find((i) => i.id === imageId);
    if (!image) return;
    setLoadingImageId(image.id);
    await deleteImageAction(calendarId, image.url, "/grids/");
    setLoadingImageId(null);
  };

  const totalPages = Math.ceil(images.length / imagesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = images.slice(startIndex, startIndex + imagesPerPage);

  return (
    <div>
      {mode === "edit" ? (
        <div className="flex flex-col gap-2 justify-start items-start">
          {!file && <DropZone onDropped={onDrop} />}
          {file && (
            <FileUpload
              calendarId={calendarId}
              file={file}
              onCompleted={(url) =>
                onImageAdded({ url, id: images.length + 1 })
              }
            />
          )}
          <Button onClick={() => setMode("view")}>Cancel</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 mt-5 grid-cols-4">
            {currentImages.map((image) => (
              <div
                key={image.id}
                className="flex flex-col items-center justify-end"
              >
                <div className="aspect-square relative cursor-pointer flex-1">
                  <Image
                    onClick={() => onImageSelected(image)}
                    src={image.url}
                    alt="Gallery Image"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  {selectedImage?.id === image.id && (
                    <RiCheckFill className="absolute w-full h-full left-0 right-0 pointer-events-none bg-white bg-opacity-40" />
                  )}
                </div>
                <Button
                  variant="light"
                  loading={loadingImageId === image.id}
                  onClick={() => onDeleteClicked(image.id)}
                >
                  Delete
                </Button>
              </div>
            ))}
            <div className="aspect-square bg-gray-200 flex justify-center items-center">
              <RiAddLine
                onClick={() => setMode("edit")}
                className="cursor-pointer outline-double hover:bg-black hover:text-white"
                size={32}
              />
            </div>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-between mt-4">
              <Button
                variant="secondary"
                icon={RiArrowLeftLine}
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              ></Button>
              {currentPage} / {totalPages}
              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                icon={RiArrowRightLine}
              ></Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gallery;
