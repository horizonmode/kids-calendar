import React from "react";
import { useDroppable } from "@dnd-kit/core";
import classNames from "classnames";
import Person from "./PersonCard";
import { Person as PersonType } from "@/types/Items";

interface PersonAssignmentProps {
  people: PersonType[] | null;
  id: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

function PersonAssignment({
  people,
  id,
  disabled = true,
  style,
}: PersonAssignmentProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div className="flex flex-row justify-start" style={style}>
      <div
        id={`person-droppable-${id}`}
        ref={setNodeRef}
        className={classNames(
          "items-center justify-start relative box-border transition-shadow duration-[250ms] ease-[ease] flex flex-row",

          disabled && "pointer-events-none"
        )}
        aria-label="Droppable region"
      >
        {people && people.length > 0 ? (
          people?.map((person, i) => (
            <Person
              highlight={!disabled}
              selected={isOver && !disabled}
              key={`person-${i}`}
              person={person}
              hideName={true}
            />
          ))
        ) : (
          <Person
            hideName={true}
            placeholder={true}
            highlight={!disabled}
            selected={isOver && !disabled}
          />
        )}
      </div>
    </div>
  );
}

export default PersonAssignment;
