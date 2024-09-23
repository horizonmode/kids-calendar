"use client";
import React, { useState } from "react";

import Gallery from "@/components/Gallery";
import { Button } from "@tremor/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import useImageContext from "@/store/images";
import { shallow } from "zustand/shallow";
import { GalleryImage } from "@/types/Items";
import useModalContext from "@/store/modals";
import { deleteImageAction } from "@/serverActions/images";
import { list } from "@/utils/blobStorage";

interface GalleryDialogProps {
  calendarId: string;
}

const GalleryDialog = ({ calendarId }: GalleryDialogProps) => {
  const [selectedImage, setSelectedImage, setEditingItem, setImages] =
    useImageContext(
      (state) => [
        state.selectedImage,
        state.setSelectedImage,
        state.setEditingItem,
        state.setImages,
      ],
      shallow
    );

  const [activeModals, setActiveModals] = useModalContext(
    (state) => [state.activeModals, state.setActiveModals],
    shallow
  );

  const [loading, setLoading] = useState(false);

  const onImageSelected = (image: GalleryImage) => {
    if (selectedImage?.id === image.id) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  const onCloseClicked = () => {
    setEditingItem(null);
    setActiveModals("gallery", false);
  };

  

  const showModal = activeModals.includes("gallery");

  return (
    <div className="flex justify-center">
      <Dialog open={showModal}>
        <DialogContent className="w-full md:w-1/2 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gallery</DialogTitle>
            <DialogDescription className="mt-1 text-sm leading-6">
              Select, Remove or Add Images
            </DialogDescription>
          </DialogHeader>
          <Gallery
            calendarId={calendarId}
            selectedImage={selectedImage}
            onImageSelected={onImageSelected}
          />
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button onClick={onCloseClicked} className="w-full sm:w-fit">
                OK
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GalleryDialog;
