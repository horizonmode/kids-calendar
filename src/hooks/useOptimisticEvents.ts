import { EventItem } from "@/types/Items";
import { useOptimistic } from "react";

const useOptimisticEvents = (events: EventItem[]) => {
  const [calendarEvents, setEvents] = useOptimistic<
    EventItem[],
    {
      events: EventItem[];
      event: EventItem;
      action: "move" | "delete" | "update";
    }
  >(events, (_, { event, events, action }) =>
    action === "delete"
      ? [...events.filter((e) => e.id !== event.id)]
      : [
          ...events.filter((e) => e.id !== event.id),
          {
            ...event,
            status:
              action === "update" || action === "move" ? "pending" : "pending",
          },
        ]
  );

  return { calendarEvents, setEvents };
};

export default useOptimisticEvents;
