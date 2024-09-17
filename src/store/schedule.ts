import { createStore } from "zustand";
import { Person, Schedule, ScheduleItem } from "@/types/Items";
import { createContext, useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

import scheduleService from "@/utils/scheduleService";
const {
  findItemInSchedules,
  cloneItems,
  addPersonIfNotExists,
  removePersonIfExists,
} = scheduleService;

export interface ScheduleProps {
  schedules: Schedule[];
  year: number;
  week: number;
}

export interface ScheduleState {
  year: number;
  week: number;
  schedules: Schedule[];
  setWeek: (week: number) => void;
  setYear: (year: number) => void;
  applyTemplate: (template: ScheduleItem[], week: number, year: number) => void;
  assignPerson: (itemId: string, person: Person) => void;
  removePerson: (sourceId: string, person: Person) => void;
}

export type ScheduleStore = ReturnType<typeof createScheduleStore>;

export const createScheduleStore = (initProps?: ScheduleProps) => {
  const DEFAULT: ScheduleProps = {
    schedules: [],
    year: new Date().getFullYear(),
    week: 1,
  };

  return createStore<ScheduleState>()((set, get) => ({
    ...DEFAULT,
    ...initProps,
    pendingChanges: 0,
    setYear: (year: number) => set({ year }),
    setWeek: (week: number) => set({ week }),
    applyTemplate: (template: ScheduleItem[], week: number, year: number) =>
      set((state: ScheduleState) => {
        const newSchedules = [...state.schedules];

        let mergedSchedule = newSchedules.find(
          (s) => s.year === year && s.week === week
        );

        if (!mergedSchedule) {
          mergedSchedule = {
            week,
            year,
            schedule: [],
            type: "schedule",
          };
          newSchedules.push(mergedSchedule);
        }
        // Add template items to schedule
        for (var i = 0; i < template.length; i++) {
          var daySchedule = template[i];
          let existingDay = mergedSchedule.schedule.find(
            (m: ScheduleItem) => m.day === daySchedule.day
          );

          if (!existingDay) {
            existingDay = {
              day: daySchedule.day,
              morning: { items: [], status: "saved" },
              afternoon: { items: [], status: "saved" },
              evening: { items: [], status: "saved" },
            };
            mergedSchedule.schedule.push(existingDay);
          }

          cloneItems(daySchedule.morning, existingDay.morning);
          cloneItems(daySchedule.afternoon, existingDay.afternoon);
          cloneItems(daySchedule.evening, existingDay.evening);
        }

        return {
          schedules: newSchedules,
        };
      }),
    assignPerson: (itemId: string, person: Person) => {
      set((state: ScheduleState) => {
        const newSchedules = [...state.schedules];
        const item = findItemInSchedules(itemId, newSchedules);
        if (!item) return state;
        addPersonIfNotExists(item, person);

        return {
          schedules: newSchedules,
        };
      });
    },
    removePerson: (sourceId: string, person: Person) => {
      set((state: ScheduleState) => {
        const newSchedules = [...state.schedules];
        const item = findItemInSchedules(sourceId, newSchedules);
        if (!item) return state;
        removePersonIfExists(item, person);

        return {
          schedules: newSchedules,
        };
      });
    },
  }));
};

export const ScheduleContext = createContext<ScheduleStore | null>(null);

function useScheduleContext<T>(
  selector: (state: ScheduleState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(ScheduleContext);
  if (!store) throw new Error("Missing ScheduleContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}

export { useScheduleContext };
