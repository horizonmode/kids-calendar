import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, Button, Icon } from "@tremor/react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiUserAddLine,
} from "@remixicon/react";
import PersonList from "./PersonList";
import PersonCard from "./PersonCard";
import { Person } from "@/types/Items";
import usePersonContext from "@/store/people";
import { shallow } from "zustand/shallow";

interface PeopleDialogProps {
  showModal: string | null;
  onClose: () => void;
  calendarId?: string;
}

const PeopleDialog: React.FC<PeopleDialogProps> = ({
  showModal,
  onClose,
  calendarId,
}) => {
  const [people, addPerson, deletePerson, editPerson, fetch] = usePersonContext(
    (state) => [state.people, state.add, state.delete, state.edit, state.fetch],
    shallow
  );

  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(
    people.length > 0 ? people[0].id : null
  );

  useEffect(() => {
    if (people.length > 0) {
      setSelectedPersonId(people[people.length - 1].id);
    }
  }, [people.length]);

  const onEdit = (person: Person) => {
    editPerson(person);
  };

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  const onNextPerson = () => {
    if (selectedPersonId === null) {
      return;
    }
    const currentIndex = people.findIndex((p) => p.id === selectedPersonId);
    if (currentIndex === -1) {
      return;
    }
    const nextIndex = currentIndex + 1;
    if (nextIndex >= people.length) {
      return;
    }
    setSelectedPersonId(people[nextIndex].id);
  };

  const onPrevPerson = () => {
    if (selectedPersonId === null) {
      return;
    }
    const currentIndex = people.findIndex((p) => p.id === selectedPersonId);
    if (currentIndex === -1) {
      return;
    }
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      return;
    }
    setSelectedPersonId(people[prevIndex].id);
  };

  const cantGoBack =
    selectedPersonId !== null &&
    people.findIndex((p) => p.id === selectedPersonId) > 0;
  const cantGoForward =
    selectedPersonId !== null &&
    people.findIndex((p) => p.id === selectedPersonId) < people.length - 1;

  return (
    <Dialog open={showModal === "people"} onClose={onClose} static={true}>
      <DialogPanel>
        <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
          Edit People
        </h3>
        <div className="flex flex-row items-center justify-center">
          <div
            className={`flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 cursor-pointer  hover:bg-slate-200 ${
              cantGoBack ? "" : "opacity-50"
            }`}
            onClick={onPrevPerson}
          >
            <Icon size="lg" icon={RiArrowLeftLine} />
          </div>

          {selectedPerson && (
            <PersonCard
              editable={true}
              person={selectedPerson}
              onEdit={onEdit}
            />
          )}
          <div
            className={`flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 cursor-pointer  hover:bg-slate-200 ${
              cantGoForward ? "" : "opacity-50"
            }`}
            onClick={onNextPerson}
          >
            <Icon size="lg" icon={RiArrowRightLine} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Button
            variant="secondary"
            icon={RiUserAddLine}
            className="w-full"
            onClick={async () => {
              addPerson({ name: "New Person", id: people.length + 1 });
            }}
          >
            Add Person
          </Button>
          <div className="flex flex-col-reverse justify-center md:flex-row-reverse gap-1">
            <Button variant="primary" className="flex-1" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={async () => {
                calendarId && (await fetch(calendarId as string));
                onClose();
              }}
            >
              Discard
            </Button>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default PeopleDialog;
