import React, { useEffect, useState } from "react";

import { Person } from "@/types/Items";
import { shallow } from "zustand/shallow";
import usePersonContext from "@/store/people";
import { Button, Dialog, DialogPanel, Icon } from "@tremor/react";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiUserAddLine,
} from "@remixicon/react";

import PersonCard from "@/components/PersonCard";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";

interface PeopleDialogProps {
  showModal: boolean;
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

  const [setPendingModal, setShowModal] = useModalContext(
    (state) => [state.setPendingModal, state.setShowModal],
    shallow
  );

  const [setEditingPerson] = useImageContext(
    (state) => [state.setEditingPerson],
    shallow
  );

  const openImagePicker = async () => {
    const person = people.find((p) => p.id === selectedPersonId);
    if (person) setEditingPerson(person);

    setPendingModal("people");
    setShowModal("gallery");
  };

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

  const onDialogClose = () => {
    setEditingPerson(null);
    setPendingModal(null);
    onClose();
  };

  const canGoBack =
    people.length > 1 &&
    selectedPersonId !== null &&
    people.findIndex((p) => p.id === selectedPersonId) > 0;

  const canGoForward =
    people.length > 1 &&
    selectedPersonId !== null &&
    people.findIndex((p) => p.id === selectedPersonId) < people.length - 1;

  return (
    <Dialog open={showModal} onClose={onClose} static={true}>
      <DialogPanel className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Edit People</h3>
        <div className="flex flex-row items-center justify-center">
          <div
            className={`flex justify-center align-middle items-center w-12 h-12 cursor-pointer hover:bg-slate-200 ${
              !canGoBack && "opacity-50 hover:bg-none"
            }`}
            onClick={onPrevPerson}
          >
            <Icon size="lg" icon={RiArrowLeftLine} />
          </div>

          {selectedPerson && (
            <div className="flex-1">
              <PersonCard
                editable={true}
                person={selectedPerson}
                onEdit={onEdit}
                openImagePicker={openImagePicker}
              />
            </div>
          )}
          <div
            className={`flex justify-center align-middle items-center overflow-visible w-12 h-12 cursor-pointer hover:bg-slate-200  ${
              !canGoForward && "opacity-50 hover:bg-none"
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
            <Button
              variant="primary"
              className="flex-1"
              onClick={onDialogClose}
            >
              Close
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={async () => {
                calendarId && (await fetch(calendarId as string));
                onDialogClose();
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
