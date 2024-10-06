"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { Person } from "@/types/Items";
import { shallow } from "zustand/shallow";
import usePersonContext from "@/store/people";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Dialog";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiUserAddLine,
  RiUserUnfollowLine,
} from "@remixicon/react";

import PersonCard from "@/components/PersonCard";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";
import { updatePeopleAction } from "@/serverActions/people";
import { Button, Icon } from "@tremor/react";

interface PeopleDialogProps {
  calendarId: string;
}

const PeopleDialog: React.FC<PeopleDialogProps> = ({ calendarId }) => {
  const [people] = usePersonContext((state) => [state.people], shallow);

  const originalPeople = useRef<Person[]>([]);
  const [editingPeople, setEditingPeople] = useState<Person[]>([]);

  const [activeModals, setActiveModals] = useModalContext(
    (state) => [state.activeModals, state.setActiveModals],
    shallow
  );

  const showModal = activeModals.includes("people");

  useLayoutEffect(() => {
    if (showModal) {
      originalPeople.current = people;
      setEditingPeople([...people]);
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

    setActiveModals("gallery", true);
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
    setActiveModals("people", false);
  };

  const [saving, setSaving] = useState(false);

  const onDialogSave = async () => {
    setSaving(true);
    await updatePeopleAction(calendarId, editingPeople, "/grids");
    setSaving(false);
    onDialogClose();
  };

  const onDialogCancel = () => {
    onDialogClose();
  };

  const onAddPerson = async () => {
    const maxId =
      editingPeople.length == 0
        ? 0
        : Math.max(...editingPeople.map((p) => p.id));
    setEditingPeople([
      ...editingPeople,
      { id: maxId + 1, name: "New Person", photo: null },
    ]);
  };

  const onDeletePerson = async (personId: number) => {
    setEditingPeople(editingPeople.filter((p) => p.id !== personId));
  };

  const canNavigate = editingPeople.length > 1;

  return (
    <Dialog open={showModal}>
      <DialogContent className="w-full md:w-1/2 max-w-2xl flex flex-col gap-3">
        <DialogHeader>
          <DialogTitle>Edit People</DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6">
            Select, Remove or Add People
          </DialogDescription>
        </DialogHeader>
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
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <PersonCard
                editable={true}
                person={selectedPerson}
                onEdit={onEdit}
                openImagePicker={openImagePicker}
              />
              {selectedPersonIndex != null && (
                <Button
                  variant="light"
                  icon={RiUserUnfollowLine}
                  onClick={() =>
                    onDeletePerson(editingPeople[selectedPersonIndex].id)
                  }
                >
                  Remove Person
                </Button>
              )}
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
          <Button
            className="absolute top-2 right-2"
            variant="secondary"
            icon={RiUserAddLine}
            onClick={onAddPerson}
          >
            Add Person
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary" onClick={onDialogCancel}>
              Discard
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button loading={saving} variant="primary" onClick={onDialogSave}>
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PeopleDialog;
