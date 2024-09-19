"use client";
import { ScheduleContext } from "@/store/schedule";
import { Schedule } from "@/types/Items";
import { useOptimistic } from "react";

export default function ScheduleProvider({
  children,
  _schedules,
  year,
  week,
}: {
  children: React.ReactNode;
  _schedules: Schedule[];
  year: number;
  week: number;
}) {
  const [schedules, setSchedule] = useOptimistic<Schedule[], Schedule>(
    _schedules,
    (state: Schedule[], schedule) => {
      schedule.status = "pending";
      const index = state.findIndex(
        (s) => s.year === schedule.year && s.week === schedule.week
      );
      if (index === -1) {
        return [...state, schedule];
      }
      const newState = [...state];
      newState[index] = schedule;
      return newState;
    }
  );

  return (
    <ScheduleContext.Provider value={{ year, week, schedules, setSchedule }}>
      {children}
    </ScheduleContext.Provider>
  );
}
