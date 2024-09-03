import React from "react";

import classNames from "classnames";

import { Icon } from "@tremor/react";
import { useDroppable } from "@dnd-kit/core";
import { Person as PersonType } from "@/types/Items";
import { RiCloseCircleLine } from "@remixicon/react";

import PersonCard from "./PersonCard";
import Draggable from "./Draggable";

interface PersonAssignmentProps {
  people: PersonType[] | null;
  id: string;
  disabled?: boolean;
  editing?: boolean;
  onRemove?: (person: PersonType) => void;
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
          "items-center justify-start relative box-border transition-shadow duration-[250ms] ease-[ease] flex flex-row pointer-events-auto"

          // disabled && "pointer-events-none"
        )}
        aria-label="Droppable region"
      >
        {people && people.length > 0 ? (
          people?.map((person, i) => (
            <Draggable
              id={`person-assignment-${id}-${i}`}
              key={`person-assignment-${id}-${i}`}
              data={{
                person: person,
                itemId: person.id,
                sourceId: id,
              }}
              style={{ position: "relative" }}
              element="people"
            >
              <PersonCard
                highlight={!disabled}
                selected={isOver && !disabled}
                person={person}
                hideName={true}
              />
            </Draggable>
          ))
        ) : (
          <PersonCard
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
