"use client";

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
  selectedDay,
}: CalendarProviderProps) {
  const store = createCalendarStore({
    days,
    events,
    selectedDay,
  });
  return (
    <CalendarContext.Provider value={store}>
      {children}
    </CalendarContext.Provider>
  );
}
