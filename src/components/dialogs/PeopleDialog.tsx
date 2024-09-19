"use client";
import React, { use, useEffect, useRef, useState } from "react";

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
  const [editingPeople, setEditingPeople] = useState<Person[]>([]);

  const [setPendingModal, setShowModal, showModal] = useModalContext(
    (state) => [state.setPendingModal, state.setShowModal, state.showModal],
    shallow
  );

  useEffect(() => {
    if (showModal) {
      originalPeople.current = people;
      setEditingPeople([...people]);
    } else {
      originalPeople.current = [];
      setEditingPeople([]);
    }
  }, [people, showModal]);

  const [selectedPersonIndex, setSelectedPersonIndex] = useState<number | null>(
    editingPeople.length > 0 ? 0 : null
  );

  const [setEditingPerson] = useImageContext(
    (state) => [state.setEditingPerson],
    shallow
  );

  const openImagePicker = async () => {
    if (selectedPersonIndex === null) return;
    const person = editingPeople[selectedPersonIndex];
    if (person) setEditingPerson(person);

    setPendingModal("people");
    setShowModal("gallery");
  };

  useEffect(() => {
    if (editingPeople.length > 0) {
      setSelectedPersonIndex(editingPeople.length - 1);
    }
  }, [editingPeople.length]);

  const onEdit = (person: Person) => {
    const index = editingPeople.findIndex((p) => p.id === person.id);
    if (index > -1) {
      const newPeople = [...editingPeople];
      newPeople[index] = person;
      setEditingPeople(newPeople);
    }
  };

  const selectedPerson = editingPeople[selectedPersonIndex || 0];

  const onNextPerson = () => {
    if (selectedPersonIndex === null) {
      return;
    }
    const currentIndex = selectedPersonIndex;
    const nextIndex =
      currentIndex === editingPeople.length - 1 ? 0 : currentIndex + 1;
    setSelectedPersonIndex(nextIndex);
  };

  const onPrevPerson = () => {
    if (selectedPersonIndex === null) {
      return;
    }
    const currentIndex = selectedPersonIndex;
    const prevIndex =
      currentIndex === 0 ? editingPeople.length - 1 : currentIndex - 1;

    setSelectedPersonIndex(prevIndex);
  };

  const onDialogClose = () => {
    setEditingPerson(null);
    setPendingModal(null);
    setShowModal(null);
  };

  const onDialogSave = async () => {
    await updatePeopleAction(calendarId, editingPeople, "/grids");
    onDialogClose();
  };

  const onDialogCancel = () => {
    onDialogClose();
  };

  const onAddPerson = async () => {
    setEditingPeople([
      ...editingPeople,
      { id: editingPeople.length + 1, name: "New Person", photo: null },
    ]);
  };

  const onDeletePerson = async (personId: number) => {
    setEditingPeople(editingPeople.filter((p) => p.id !== personId));
  };

  const canNavigate = editingPeople.length > 1;

  return (
    <Dialog open={showModal === "people"} onClose={onDialogClose} static={true}>
      <DialogPanel className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Edit People</h3>
        <div className="flex flex-row items-center justify-center">
          {editingPeople.length > 0 && (
            <div
              className={`flex justify-center align-middle items-center w-12 h-12 cursor-pointer hover:bg-slate-200 ${
                !canNavigate && "opacity-50 hover:bg-none pointer-events-none"
              }`}
              onClick={onPrevPerson}
            >
              <Icon size="lg" icon={RiArrowLeftLine} />
            </div>
          )}
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
          {editingPeople.length > 0 && (
            <div
              className={`flex justify-center align-middle items-center overflow-visible w-12 h-12 cursor-pointer hover:bg-slate-200  ${
                !canNavigate && "opacity-50 hover:bg-none pointer-events-none"
              }`}
              onClick={onNextPerson}
            >
              <Icon size="lg" icon={RiArrowRightLine} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-1">
            {selectedPersonIndex != null && (
              <Button
                variant="secondary"
                icon={RiUserAddLine}
                onClick={() =>
                  onDeletePerson(editingPeople[selectedPersonIndex].id)
                }
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
          <div className="flex justify-center flex-row-reverse gap-1">
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
