"use client";
import React from "react";

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

interface GalleryDialogProps {
  calendarId: string;
}

const GalleryDialog = ({ calendarId }: GalleryDialogProps) => {
  const [selectedImage, setSelectedImage, setEditingItem] = useImageContext(
    (state) => [
      state.selectedImage,
      state.setSelectedImage,
      state.setEditingItem,
    ],
    shallow
  );

  const [showModal, setShowModal] = useModalContext(
    (state) => [state.showModal, state.setShowModal],
    shallow
  );

  const onImageSelected = (image: GalleryImage) => {
    if (selectedImage?.id === image.id) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  const onCloseClicked = () => {
    setEditingItem(null);
    setShowModal(null);
  };

  const onDeleteClicked = async () => {
    if (selectedImage) {
      await deleteImageAction(selectedImage.url);
    }
  };

  return (
    <div className="flex justify-center">
      <Dialog open={showModal === "gallery"}>
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
            <Button
              variant="secondary"
              onClick={onDeleteClicked}
              className="w-full sm:w-fit"
            >
              Delete
            </Button>
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
