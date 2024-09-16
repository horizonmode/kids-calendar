import { CalendarDay } from "@/types/Items";
import { useOptimistic } from "react";

const useOptimisticCalendarDays = (days: CalendarDay[]) => {
  const [calendarDays, setCalendarDays] = useOptimistic<
    CalendarDay[],
    {
      sourceDay: CalendarDay;
      targetDay: CalendarDay;
      targetItemIndex: number;
      action: "move" | "delete" | "update";
    }
  >(days, (previousState, { sourceDay, targetDay, targetItemIndex, action }) =>
    sourceDay.day === targetDay.day
      ? [
          ...previousState.filter((d) => d.day !== targetDay.day),
          {
            ...targetDay,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
            items: [
              ...targetDay.items.slice(0, targetItemIndex),
              {
                ...targetDay.items[targetItemIndex],
              },
              ...targetDay.items.slice(targetItemIndex + 1),
            ],
          },
        ]
      : [
          ...previousState.filter(
            (d) => d.day !== targetDay.day && d.day !== sourceDay.day
          ),
          {
            ...sourceDay,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
          },
          {
            ...targetDay,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
            items: [
              ...targetDay.items.slice(0, targetItemIndex),
              {
                ...targetDay.items[targetItemIndex],
                status:
                  action === "update" || action === "move"
                    ? "pending"
                    : "pending",
              },
              ...targetDay.items.slice(targetItemIndex + 1),
            ],
          },
        ]
  );

  return { calendarDays, setCalendarDays };
};

export default useOptimisticCalendarDays;
