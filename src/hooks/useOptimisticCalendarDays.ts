import { CalendarDay } from "@/types/Items";
import { useOptimistic } from "react";

const useOptimisticCalendarDays = (days: CalendarDay[]) => {
  const [calendarDays, setCalendarDays] = useOptimistic<
    CalendarDay[],
    {
      sourceDay: CalendarDay | null;
      targetDay: CalendarDay;
      targetItemIndex: number;
      action: "move" | "delete" | "update";
    }
  >(days, (previousState, { sourceDay, targetDay, targetItemIndex, action }) =>
    sourceDay == null || sourceDay.day === targetDay.day
      ? [
          ...previousState.filter((d) => d.day !== targetDay.day),
          {
            ...targetDay,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
          },
        ]
      : [
          ...previousState.filter((d) => d.day !== targetDay.day),
          {
            ...sourceDay,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
          },
          {
            ...targetDay,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
          },
        ]
  );

  return { calendarDays, setCalendarDays };
};

export default useOptimisticCalendarDays;
