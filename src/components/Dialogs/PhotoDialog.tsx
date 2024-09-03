import React, { use, useEffect, useState } from "react";

import Gallery from "@/components/Gallery";
import { Button } from "@tremor/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/Dialog";
import useImageContext, { Image as ImageType } from "@/store/images";
import Image from "next/image";
import { shallow } from "zustand/shallow";
import { RiCloseLine } from "@remixicon/react";

interface PhotoDialogProps {
  show: boolean;
  onClose: () => void;
}

const PhotoDialog = ({ show, onClose }: PhotoDialogProps) => {
  const [editingItem] = useImageContext(
    (state) => [state.editingItem],
    shallow
  );

  const image = editingItem?.file || "";
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (image) {
      setSelectedImage(image);
    }
  }, [image]);

  console.log(selectedImage);

  return (
    <div className="flex justify-center">
      <Dialog open={show}>
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
