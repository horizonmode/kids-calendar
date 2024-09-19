"use client";
import React, { useEffect, useRef, useState } from "react";

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
import { updatePeopleAction } from "@/serverActions/people";

interface PeopleDialogProps {
  calendarId: string;
}

const PeopleDialog: React.FC<PeopleDialogProps> = ({ calendarId }) => {
  const [people, editPerson, setPeople] = usePersonContext(
    (state) => [state.people, state.edit, state.setPeople],
    shallow
  );

  const originalPeople = useRef<Person[]>([]);

  const [setPendingModal, setShowModal, showModal] = useModalContext(
    (state) => [state.setPendingModal, state.setShowModal, state.showModal],
    shallow
  );

  useEffect(() => {
    if (showModal) originalPeople.current = people;
    else originalPeople.current = [];
  }, [people, showModal]);

  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number | null>(
    people.length > 0 ? 0 : null
  );

  const [setEditingPerson] = useImageContext(
    (state) => [state.setEditingPerson],
    shallow
  );

  const openImagePicker = async () => {
    if (selectedPersonIndex === null) return;
    const person = people[selectedPersonIndex];
    if (person) setEditingPerson(person);

    setPendingModal("people");
    setShowModal("gallery");
  };

  useEffect(() => {
    if (people.length > 0) {
      setSelectedPersonIndex(people.length - 1);
    }
  }, [people.length]);

  const onEdit = (person: Person) => {
    editPerson(person);
  };

  const selectedPerson = people[selectedPersonIndex || 0];

  const onNextPerson = () => {
    if (selectedPersonIndex === null) {
      return;
    }
    if (selectedPersonIndex === -1) {
      return;
    }
    const nextIndex = selectedPersonIndex + 1;
    if (nextIndex >= people.length) {
      return;
    }
    setSelectedPersonIndex(nextIndex);
  };

  const onPrevPerson = () => {
    if (selectedPersonIndex === null) {
      return;
    }
    const currentIndex = selectedPersonIndex;
    if (currentIndex === -1) {
      return;
    }
    const prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      return;
    }
    setSelectedPersonIndex(prevIndex);
  };

  const onDialogClose = () => {
    setEditingPerson(null);
    setPendingModal(null);
    setShowModal(null);
  };

  const onDialogSave = async () => {
    setPeople(await updatePeopleAction(calendarId, people));
    onDialogClose();
  };

  const onDialogCancel = () => {
    const people = setPeople(originalPeople.current);
    onDialogClose();
  };

  const onAddPerson = async () => {
    setPeople([
      ...people,
      { id: people.length + 1, name: "New Person", photo: null },
    ]);
  };

  const onDeletePerson = async (personId: number) => {
    setPeople(people.filter((p) => p.id !== personId));
  };

  const canGoBack =
    people.length > 1 &&
    selectedPersonIndex !== null &&
    selectedPersonIndex > people.length - 1;

  const canGoForward =
    people.length > 1 &&
    selectedPersonIndex !== null &&
    people.length > selectedPersonIndex + 1;

  return (
    <Dialog open={showModal === "people"} onClose={onDialogClose} static={true}>
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
        <div className="flex flex-col gap-2">
          <div className="flex flex-col md:flex-row gap-1">
            {selectedPersonIndex != null && (
              <Button
                variant="secondary"
                icon={RiUserAddLine}
                onClick={() => onDeletePerson(people[selectedPersonIndex].id)}
              >
                Remove Person
              </Button>
            )}
            <Button
              variant="secondary"
              icon={RiUserAddLine}
              onClick={onAddPerson}
            >
              Add Person
            </Button>
          </div>
          <div className="flex flex-col-reverse justify-center md:flex-row-reverse gap-1">
            <Button variant="primary" className="flex-1" onClick={onDialogSave}>
              Save
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onDialogCancel}
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
