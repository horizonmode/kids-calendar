import { useCalendarContext } from "@/store/calendar";
import { useEffect } from "react";
import { shallow } from "zustand/shallow";
import { useServerAction } from "./useServerAction";
import { UpdateDaysAction, updateDaysAction } from "@/serverActions/days";
import { updateEventsAction, UpdateEventsAction } from "@/serverActions/events";

const useSync = (calendarId: string) => {
  const [pendingChanges, syncCalendar] = useCalendarContext(
    (state) => [state.pendingChanges, state.sync],
    shallow
  );

  const [updateDayAction, isDayPending] = useServerAction(updateDaysAction);
  const [updateEventAction, isEventPending] =
    useServerAction(updateEventsAction);

  const isPending = isDayPending || isEventPending;

  const sync = async () => {
    if (pendingChanges === 0) return;
    await syncCalendar(
      calendarId,
      updateDayAction as UpdateDaysAction,
      updateEventAction as UpdateEventsAction
    );
  };

  useEffect(() => {
    const doSync = async () => {
      console.log("syncing");
      await sync();
    };

    if (pendingChanges > 0) {
      doSync();
    }
  }, [pendingChanges]);

  return { isPending };
};

export default useSync;
