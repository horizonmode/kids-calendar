import React, { useState } from "react";
import { RiArrowDownLine } from "@remixicon/react";
import { Icon } from "@tremor/react";
import { useDroppable } from "@dnd-kit/core";
import PersonCard from "./PersonCard";
import Draggable from "./Draggable";
import { Person } from "@/types/Items";

interface PersonSelectProps {
  people: Person[];
}

const PersonSelect = ({ people }: PersonSelectProps) => {
  const [open, setOpen] = useState(true);

  const { isOver, setNodeRef } = useDroppable({
    id: "toolbar-person",
  });

  return (
    <div
      className="overflow-visible  top-1/2 -translate-y-1/2 z-50  fixed flex touch-none"
      style={{
        transition: "left .5s, top .5s",
        width: "8vh",
        height: "50vh",
        left: open ? "0" : "-8vh",
        outline: isOver ? "1px solid red" : "none",
      }}
    >
      <div
        className={`absolute -top-0 z-50 -right-12 bg-white bg-opacity-90 overflow-visible rounded-r-xl flex flex-col-reverse cursor-pointer`}
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
      </div>
      <div
        className={`flex flex-col bg-white
        bg-opacity-90 p-auto overflow-x-hidden hover:overflow-y-auto  rounded-br-xl flex-1 items-center pt-3 justify-start gap-2 touch-none`}
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
      </div>
    </div>
  );
};

export default PersonSelect;
