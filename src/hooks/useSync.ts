import useModalContext from "@/store/modals";

const useSync = (
    calendarId,
) => {
  const [people, syncPeople] =
  usePersonContext(
    (state) => [
      state.people,
      state.syncPeople,
    ],
    shallow
  );

  const [setShowModal] =
  useModalContext(
    (state) => [
      state.setShowModal,
    ],
    shallow
  );

  const [saving, setSaving] = useState<boolean>(false)

  const sync = () => {
    const save = async () => {
      setSaving(true);
      if (calendarId && sync) sync(calendarId);
      if (people && syncPeople) syncPeople(calendarId);
      setShowModal("saved");
      setSaving(false);
    };
    save();
  };

  return {saving, sync};
};

export default useSync;
