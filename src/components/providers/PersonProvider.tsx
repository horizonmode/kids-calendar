"use client";
import { useRef } from "react";
import {
  PersonContext,
  PersonProps,
  PersonStore,
  createPersonStore,
} from "@/store/people";

type PersonProviderProps = React.PropsWithChildren<PersonProps>;

export default function PersonProvider({
  children,
  ...props
}: PersonProviderProps) {
  const storeRef = useRef<PersonStore>();
  if (!storeRef.current) {
    storeRef.current = createPersonStore(props);
  }

  return (
    <PersonContext.Provider value={storeRef.current}>
      {children}
    </PersonContext.Provider>
  );
}
