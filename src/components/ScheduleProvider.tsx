"use client";
import { useRef } from "react";

import {
  ScheduleContext,
  ScheduleProps,
  ScheduleStore,
  createScheduleStore,
} from "@/store/schedule";

type ScheduleProviderProps = React.PropsWithChildren<ScheduleProps>;

export default function ScheduleProvider({
  children,
  ...props
}: ScheduleProviderProps) {
  const storeRef = useRef<ScheduleStore>();
  if (!storeRef.current) {
    storeRef.current = createScheduleStore(props);
  }

  return (
    <ScheduleContext.Provider value={storeRef.current}>
      {children}
    </ScheduleContext.Provider>
  );
}
