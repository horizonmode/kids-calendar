"use client";
import React, { useEffect, useState } from "react";

import Image from "next/image";
import { Button } from "@tremor/react";
import { shallow } from "zustand/shallow";
import useImageContext from "@/store/images";
import { RiCloseLine } from "@remixicon/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  VisuallyHidden,
} from "@/components/Dialog";
import useModalContext from "@/store/modals";

const PhotoDialog = () => {
  const [editingItem] = useImageContext(
    (state) => [state.editingItem],
    shallow
  );

  const [activeModals, setActiveModals] = useModalContext(
    (state) => [state.activeModals, state.setActiveModals],
    shallow
  );

  const image = editingItem?.image || "";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      setSelectedImage(image.url);
    }
  }, [image]);

  const onClose = () => {
    setActiveModals("photo", false);
  };

  const show = activeModals.includes("photo");

  return (
    <div className="flex justify-center">
      <Dialog open={show}>
        <DialogHeader>
          <VisuallyHidden.Root>
            <DialogTitle>View Photo</DialogTitle>
          </VisuallyHidden.Root>
        </DialogHeader>
        <DialogContent className="w-full h-full md:w-1/2 md:h-1/2 max-w-2xl flex flex-col gap-3 p-0 bg-none">
          {selectedImage && (
            <div className="relative flex-1 p-2">
              <Image
                style={{ objectFit: "contain" }}
                fill
                src={selectedImage}
                alt="highlighted image"
              />
            </div>
          )}
          <DialogFooter className="absolute top-2 right-2">
            <DialogClose asChild>
              <Button
                variant="light"
                icon={RiCloseLine}
                size="xl"
                onClick={onClose}
                className="p-2 "
              ></Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoDialog;
