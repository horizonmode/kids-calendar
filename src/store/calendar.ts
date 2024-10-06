import { createContext, useContext } from "react";
import { createStore } from "zustand";
import calendarService from "@/utils/calendarService";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { CalendarDay, EventItem } from "@/types/Items";
import { persist } from "zustand/middleware";

export interface CalendarProps {
  days: CalendarDay[];
  events: EventItem[];
  selectedDay: Date;
}

export interface CalendarState extends CalendarProps {
  days: CalendarDay[];
  events: EventItem[];
  selectedDay: Date;
  locked: boolean;
  selectedGroup: string | null;
  setLocked: (locked: boolean) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  setSelectedDay: (selectedDay: Date) => void;
  setDays: (days: CalendarDay[]) => void;
  addDay: (day: CalendarDay) => void;
  setDay: (day: CalendarDay) => void;
  setSelectedGroup: (selectedGroup: string | null) => void;
}

export type CalendarStore = ReturnType<typeof createCalendarStore>;

export const createCalendarStore = (initProps?: CalendarProps) => {
  const DEFAULT: CalendarProps = {
    days: [],
    events: [],
    selectedDay: new Date(),
  };
  return createStore<CalendarState>()(
    persist(
      (set, get) => ({
        ...DEFAULT,
        ...initProps,
        locked: false,
        selectedGroup: null,
        setSelectedGroup: (selectedGroup: string | null) =>
          set(() => {
            return { selectedGroup };
          }),
        setLocked: (locked: boolean) =>
          set(() => {
            return { locked };
          }),
        nextMonth: () =>
          set((state: CalendarState) => ({
            selectedDay: calendarService.adjustDateByMonth(
              state.selectedDay.getMonth() + 1,
              state.selectedDay
            ),
          })),
        prevMonth: () =>
          set((state: CalendarState) => ({
            selectedDay: calendarService.adjustDateByMonth(
              state.selectedDay.getMonth() - 1,
              state.selectedDay
            ),
          })),
        setSelectedDay: (selectedDay: Date) => set(() => ({ selectedDay })),
        setDays: (days: CalendarDay[]) =>
          set(() => ({
            days,
          })),
        setDay: (day: CalendarDay) =>
          set((state: CalendarState) => {
            const { days } = state;
            const index = days.findIndex(
              (d) =>
                d.day === day.day &&
                d.month === day.month &&
                d.year === day.year
            );
            days[index] = day;
            return { days };
          }),
        addDay: (day: CalendarDay) =>
          set((state: CalendarState) => ({ days: [...state.days, day] })),
      }),
      {
        name: "calendar-storage",
        storage: {
          getItem: (name) => {
            const str = localStorage.getItem(name);
            if (!str) return null;
            return {
              state: {
                ...JSON.parse(str).state,
              },
            };
          },
          setItem: (name, newValue) => {
            const str = JSON.stringify({
              state: {
                ...newValue.state,
              },
            });
            localStorage.setItem(name, str);
          },
          removeItem: (name) => localStorage.removeItem(name),
        },
        partialize: (state) => ({ locked: state.locked }),
      }
    )
  );
};

export const CalendarContext = createContext<CalendarStore | null>(null);

function useCalendarContext<T>(
  selector: (state: CalendarState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(CalendarContext);
  if (!store) throw new Error("Missing CalendarContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}

export { useCalendarContext };
