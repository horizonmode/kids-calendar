import { useCalendarContext } from "@/store/calendar";
import useModalContext from "@/store/modals";
import usePersonContext from "@/store/people";
import { useState } from "react";
import { shallow } from "zustand/shallow";

const useSync = (calendarId: string) => {
  const [people, syncPeople] = usePersonContext(
    (state) => [state.people, state.sync],
    shallow
  );

  const [sync] = useCalendarContext((state) => [state.sync], shallow);

  const [setShowModal] = useModalContext(
    (state) => [state.setShowModal],
    shallow
  );

  const [saving, setSaving] = useState<boolean>(false);

  const syncAll = () => {
    const save = async () => {
      setSaving(true);
      if (calendarId && sync) sync(calendarId);
      if (people && syncPeople) syncPeople(calendarId);
      setShowModal("saved");
      setSaving(false);
    };
    save();
  };

  return { saving, sync: syncAll };
};

export default useSync;
