import React from "react";

import classNames from "classnames";

import { Icon } from "@tremor/react";
import { useDroppable } from "@dnd-kit/core";
import { Person as PersonType } from "@/types/Items";
import { RiCloseCircleLine } from "@remixicon/react";

import Person from "./PersonCard";

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
  editing = false,
  style,
  onRemove,
}: PersonAssignmentProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      className="flex flex-row justify-start"
      data-no-dnd={editing ? "true" : "false"}
      style={style}
    >
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
            <div className="relative" key={`person-${i}`}>
              <Person
                highlight={!disabled}
                selected={isOver && !disabled}
                person={person}
                hideName={true}
              />
              {editing && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemove && onRemove(person);
                  }}
                  className="pointer-events-auto flex-1 flex justify-center align-middle items-center overflow-visible w-full h-full absolute left-0 top-0 rounded-full z-20 "
                >
                  <Icon
                    size="lg"
                    className="text-white"
                    data-no-dnd="true"
                    icon={RiCloseCircleLine}
                  />
                </div>
              )}
            </div>
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
