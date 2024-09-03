"use client";
import { useRef } from "react";

import { ModalContext, ModalStore, createModalStore } from "@/store/modals";

type ModalProviderProps = React.PropsWithChildren;

export default function CalendarProvider({ children }: ModalProviderProps) {
  const storeRef = useRef<ModalStore>();
  if (!storeRef.current) {
    storeRef.current = createModalStore();
  }

  return (
    <ModalContext.Provider value={storeRef.current}>
      {children}
    </ModalContext.Provider>
  );
}
