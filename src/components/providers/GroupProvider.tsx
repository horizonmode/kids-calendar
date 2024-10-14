"use client";
import { useRef } from "react";
import { GroupContext, GroupStore, createGroupStore } from "@/store/groups";

type ModalProviderProps = React.PropsWithChildren;

export default function CalendarProvider({ children }: ModalProviderProps) {
  const storeRef = useRef<GroupStore>();
  if (!storeRef.current) {
    storeRef.current = createGroupStore();
  }

  return (
    <GroupContext.Provider value={storeRef.current}>
      {children}
    </GroupContext.Provider>
  );
}
