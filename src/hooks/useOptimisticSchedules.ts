import {
  GenericItem,
  Schedule,
  ScheduleItem,
  ScheduleSection,
  Section,
} from "@/types/Items";
import { useOptimistic } from "react";

const useOptimisticSchedules = (schedule: Schedule) => {
  const [optimisticSchedules, setSchedules] = useOptimistic<
    Schedule,
    {
      item: GenericItem;
      day: number;
      section: Section;
      action: "move" | "delete" | "update";
    }
  >(schedule, (previousState, { item, section, action, day }) => ({
    ...previousState,
    schedule: previousState.schedule.map((si) => {
      if (si.day !== day) return si;
      const scheduleSection = si[
        `${section}` as keyof ScheduleItem
      ] as ScheduleSection;
      return {
        ...si,
        [`${section}`]: {
          items: scheduleSection.items.map((s) =>
            s.id === item.id ? (action === "delete" ? null : item) : s
          ),
          status: "pending",
        },
      };
    }),
  }));

  return { optimisticSchedules, setSchedules };
};

export default useOptimisticSchedules;
