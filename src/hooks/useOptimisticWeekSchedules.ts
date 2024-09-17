import { ScheduleItem, Section } from "@/types/Items";
import { stat } from "fs";
import { use, useOptimistic } from "react";

const useOptimisticSchedules = (source: ScheduleItem[]) => {
  const [schedules, setSchedules] = useOptimistic<
    ScheduleItem[],
    {
      source: ScheduleItem | null;
      target: ScheduleItem;
      targetItemIndex: number;
      targetSection: Section;
      action: "move" | "delete" | "update";
    }
  >(
    source,
    (
      previousState,
      { source, target, targetItemIndex, targetSection, action }
    ) =>
      !source || source.day === target.day
        ? [
            ...previousState.filter((d) => d.day !== target.day),
            {
              ...target,

              [`${targetSection}`]: {
                ...target[`${targetSection}`],
                status: "pending",
              },
            },
          ]
        : [
            ...previousState.filter(
              (d) => d.day !== target.day && d.day !== source.day
            ),
            {
              ...source,
            },
            {
              ...target,
              [`${targetSection}`]: {
                ...target[`${targetSection}`],
                status: "pending",
              },
            },
          ]
  );

  return { schedules, setSchedules };
};

export default useOptimisticSchedules;
