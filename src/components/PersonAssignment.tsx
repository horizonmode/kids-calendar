import React, { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import classNames from "classnames";
import Person from "./Person";
import { RiUserAddLine } from "@remixicon/react";
import { Icon } from "@tremor/react";

interface PersonAssignmentProps {
  people: string[] | null;
  id: string;
  disabled?: boolean;
}

function PersonAssignment({
  people,
  id,
  disabled = true,
}: PersonAssignmentProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div className="flex flex-row justify-start">
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
              className={`${classNames(
                !disabled &&
                  "outline-green-500 outline-2 outline-dotted rounded-full",
                !disabled &&
                  isOver &&
                  "outline-4 outline-double shadow-[inset_#1eb99d_0_0_0_3px,rgba(201,211,219,0.5)_20px_14px_24px]"
              )}}`}
              key={`person-${i}`}
              name={person}
              hideName={true}
            />
          ))
        ) : (
          <div
            className={classNames(
              `flex justify-center align-middle items-center w-12 h-12 rounded-full bg-white outline-1 outline-black`,
              !disabled &&
                "outline-green-500 outline-2 outline-dotted rounded-full",
              !disabled &&
                isOver &&
                "outline-4 shadow-[inset_#1eb99d_0_0_0_3px,rgba(201,211,219,0.5)_20px_14px_24px]"
            )}
          >
            <Icon size="lg" icon={RiUserAddLine} className="rounded-ful" />
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonAssignment;
