import React from "react";

import Gallery from "./Gallery";
import { Button } from "@tremor/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import useImageContext, { Image } from "@/store/images";
import { shallow } from "zustand/shallow";

interface GalleryDialogProps {
  showModal: boolean;
  onClose: () => void;
  calendarId: string;
}

const GalleryDialog = ({
  showModal,
  onClose,
  calendarId,
}: GalleryDialogProps) => {
  const [selectedImage, setSelectedImage, setEditingItem] = useImageContext(
    (state) => [
      state.selectedImage,
      state.setSelectedImage,
      state.setEditingItem,
    ],
    shallow
  );

  const onImageSelected = (image: Image) => {
    if (selectedImage?.id === image.id) {
      setSelectedImage(null);
    } else {
      setSelectedImage(image);
    }
  };

  const onCloseClicked = () => {
    setEditingItem(null);
    onClose();
  };
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
