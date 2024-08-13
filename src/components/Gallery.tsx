import {
  Card,
  Dialog,
  DialogPanel,
  DialogPanelProps,
  Button,
} from "@tremor/react";

interface GalleryProps {
  show: boolean;
  onClose: () => void;
}

export function Gallery({ show, onClose }: GalleryProps) {
  return (
    <Dialog open={show} onClose={onClose} static={true}>
      <DialogPanel>
        <img
          className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-800 mx-auto"
          src="https://randomuser.me/api/portraits/women/21.jpg"
          alt=""
        />
        <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong"></h3>
        <p className="mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Your calendar was saved successfully.
        </p>
        <Button className="mt-8 w-full" onClick={() => onClose}>
          Ok
        </Button>
      </DialogPanel>
    </Dialog>
  );
}

export default Gallery;
