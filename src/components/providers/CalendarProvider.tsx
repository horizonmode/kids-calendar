"use client";
import { useMemo } from "react";

import {
  CalendarContext,
  CalendarProps,
  createCalendarStore,
} from "@/store/calendar";

type CalendarProviderProps = React.PropsWithChildren<CalendarProps>;

export default function CalendarProvider({
  children,
  days,
  events,
  editDaysAction,
  editEventsAction,
}: CalendarProviderProps) {
  const store = useMemo(
    () =>
      createCalendarStore({
        days,
        events,
        editDaysAction,
        editEventsAction,
      }),
    [days, editDaysAction, editEventsAction, events]
  );
  return (
    <CalendarContext.Provider value={store}>
      {children}
    </CalendarContext.Provider>
  );
}
