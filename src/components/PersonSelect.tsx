import React, { useEffect, useState } from "react";
import { RiArrowDownLine, RiEditLine, RiEye2Line } from "@remixicon/react";
import { Icon } from "@tremor/react";
import { useDroppable } from "@dnd-kit/core";
import PersonCard from "./PersonCard";
import Draggable from "./Draggable";
import { Person } from "@/types/Items";

interface PersonSelectProps {
  people: Person[];
  showUsers?: boolean;
  onToggleShowPeople?: () => void;
  addPerson?: () => void;
  disabled?: boolean;
}

const PersonSelect = ({
  people,
  showUsers,
  onToggleShowPeople,
  addPerson,
  disabled = false,
}: PersonSelectProps) => {
  const [open, setOpen] = useState(true);

  const { isOver, setNodeRef, active } = useDroppable({
    id: "toolbar-person",
    disabled,
  });

  useEffect(() => {
    if (!disabled) {
      setOpen(true);
    }
  }, [disabled]);

  const isValidOver = isOver && active?.data?.current?.type === "people";

  return (
    <div
      className="overflow-visible  top-1/2 -translate-y-1/2 z-50  fixed flex touch-none h-auto"
      ref={setNodeRef}
      style={{
        transition: "left .5s, top .5s",
        width: "8vh",
        left: disabled || !open ? "-8vh" : "0",
        outline: isValidOver ? "2px solid green" : "none",
      }}
    >
      {!disabled && (
        <div
          className={`absolute -top-0 z-50 -right-12 bg-white bg-opacity-90 overflow-visible rounded-tr-xl flex flex-col cursor-pointer`}
        >
          <div
            className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200"
            onClick={() => setOpen(!open)}
          >
            <Icon
              style={{
                transform: !open ? "rotate(270deg)" : "rotate(90deg)",
                transition: "top 2s, left 2s, transform .5s",
              }}
              size="lg"
              icon={RiArrowDownLine}
            />
          </div>

          <div
            className={`flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12  ${
              showUsers ? "  border-teal-300 border" : "hover:bg-slate-200"
            }`}
            onClick={onToggleShowPeople}
          >
            <Icon size="lg" icon={RiEye2Line} />
          </div>
        </div>
      )}
      <div
        className={`flex flex-col bg-white
        bg-opacity-90 p-auto overflow-x-hidden hover:overflow-y-auto flex-1 items-center pt-3 justify-start gap-2 touch-none`}
      >
        {people.map((person, i) => (
          <Draggable
            key={`person-${i}`}
            element="people"
            style={{ position: "relative" }}
            id={person.id.toString()}
            data={{ person: person }}
          >
            <PersonCard person={person} />
          </Draggable>
        ))}

        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200 p-2 cursor-pointer"
          onClick={addPerson}
        >
          <Icon size="lg" icon={RiEditLine} />
        </div>
      </div>
    </div>
  );
};

export default PersonSelect;
