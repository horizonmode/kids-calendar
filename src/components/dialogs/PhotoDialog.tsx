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
} from "@/components/Dialog";
import useModalContext from "@/store/modals";

const PhotoDialog = () => {
  const [editingItem] = useImageContext(
    (state) => [state.editingItem],
    shallow
  );

  const [showModal, setShowModal] = useModalContext(
    (state) => [state.showModal, state.setShowModal],
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
    setShowModal(null);
  };

  return (
    <div className="flex justify-center">
      <Dialog open={showModal === "photo"}>
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
