"use client";
import { useRef, useState } from "react";

import {
  CalendarContext,
  CalendarProps,
  CalendarStore,
  createCalendarStore,
} from "@/store/calendar";

type CalendarProviderProps = React.PropsWithChildren<CalendarProps>;

export default function CalendarProvider({
  children,
  ...props
}: CalendarProviderProps) {
  const storeRef = useRef<CalendarStore>();
  if (!storeRef.current) {
    storeRef.current = createCalendarStore(props);
  }

  return (
    <CalendarContext.Provider value={storeRef.current}>
      {children}
    </CalendarContext.Provider>
  );
}
