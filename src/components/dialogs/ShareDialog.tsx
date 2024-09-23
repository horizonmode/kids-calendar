"use client";
import React from "react";

import { shallow } from "zustand/shallow";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import { RiClipboardLine } from "@remixicon/react";

import useModalContext from "@/store/modals";
import { Button, TextInput } from "@tremor/react";
import { useRouter } from "next/navigation";

interface ShareDialogProps {
  calendarId: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ calendarId }) => {
  const [activeModals, setActiveModals] = useModalContext(
    (state) => [state.activeModals, state.setActiveModals],
    shallow
  );

  const router = useRouter();

  const onClipboardClick = () => {
    navigator.clipboard.writeText(window?.location?.href);
  };

  const createNew = () => {
    router.push("/", { scroll: false });
  };

  const showModal = activeModals.includes("share");

  return (
    <Dialog
      open={showModal}
      onOpenChange={() => setActiveModals("share", false)}
    >
      <DialogContent className="w-full md:w-1/4 max-w-xl flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Share Calendar</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6">
            Share Calendar Link
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-row gap-2">
          <TextInput
            className="flex-1"
            value={global.window === undefined ? "" : window.location.href}
          />
          <Button
            className="opacity-100 pl-5 pr-5"
            variant="primary"
            icon={RiClipboardLine}
            onClick={onClipboardClick}
          ></Button>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => createNew()}>
            Create Blank Calendar
          </Button>
          <DialogClose asChild>
            <Button variant="primary">Ok</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
