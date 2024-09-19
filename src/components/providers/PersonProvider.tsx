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
  const store = createPersonStore(props);
  return (
    <PersonContext.Provider value={store}>{children}</PersonContext.Provider>
  );
}
