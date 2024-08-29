import React, { useState } from "react";
import {
  RiArrowDownLine,
  RiEditLine,
  RiEye2Line,
  RiUser4Line,
} from "@remixicon/react";
import { Icon } from "@tremor/react";
import { useDroppable } from "@dnd-kit/core";
import PersonCard from "./PersonCard";
import Draggable from "./Draggable";
import { Person } from "@/types/Items";

interface PersonSelectProps {
  people: Person[];
  showUsers?: boolean;
  onToggleShowPeople?: () => void;
  onToggleEditPeople?: () => void;
  addPerson?: () => void;
}

const PersonSelect = ({
  people,
  showUsers,
  onToggleShowPeople,
  onToggleEditPeople,
  addPerson,
}: PersonSelectProps) => {
  const [open, setOpen] = useState(true);

  const { isOver } = useDroppable({
    id: "toolbar-person",
  });

  return (
    <div
      className="overflow-visible  top-1/2 -translate-y-1/2 z-50  fixed flex touch-none h-auto"
      style={{
        transition: "left .5s, top .5s",
        width: "8vh",
        left: open ? "0" : "-8vh",
        outline: isOver ? "2px solid green" : "none",
      }}
    >
      <div
        className={`absolute -top-0 z-50 -right-12 bg-white bg-opacity-90 overflow-visible rounded-tr-xl flex flex-col-reverse cursor-pointer`}
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
        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200 cursor-pointer"
          onClick={onToggleEditPeople}
        >
          <Icon size="lg" icon={RiEditLine} />
        </div>
      </div>
      <div
        className={`flex flex-col bg-white
        bg-opacity-90 p-auto overflow-x-hidden hover:overflow-y-auto flex-1 items-center pt-3 justify-start gap-2 touch-none`}
      >
        {people.map((person, i) => (
          <Draggable
            key={`person-${i}`}
            element="person"
            style={{ position: "relative" }}
            id={person.id.toString()}
            data={{ person: person, type: "person" }}
          >
            <PersonCard person={person} />
          </Draggable>
        ))}

        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200 p-2 cursor-pointer"
          onClick={addPerson}
        >
          <Icon size="lg" icon={RiUser4Line} />
        </div>
      </div>
    </div>
  );
};

export default PersonSelect;
