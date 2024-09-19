"use client";

import { Schedule, Template } from "@/types/Items";
import { createContext, useContext } from "react";

type ScheduleContextType = {
  schedules: Schedule[];
  year: number;
  week: number;
  setSchedule: (schedule: Schedule) => void;
};

export const ScheduleContext = createContext<ScheduleContextType | null>(null);

export function useScheduleContext(): ScheduleContextType {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("no schedule context in the tree");
  }
  return context;
}
