import React, { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import classNames from "classnames";

interface PersonAssignmentProps {
  children: ReactNode;
  id: string;
  draggingId: string;
  day?: number;
  highlight?: boolean;
  label?: string;
  isToday: boolean;
  isPast: boolean;
}

function PersonAssignment({
  children,
  id,
  draggingId,
  day,
  highlight = false,
  label = "",
}: PersonAssignmentProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      id={`person-droppable-${id}`}
      ref={setNodeRef}
      className={classNames(
        "items-center justify-center relative box-border bg-[#f0f0f1] transition-shadow duration-[250ms] ease-[ease] flex-1 aspect-[1] max-w-[100vh] grid grid-cols-[repeat(auto-fit,minmax(20px,max-content))] ml-0 mr-0.5 mt-0 mb-0.5 outline outline-1 outline-black",
        isOver &&
          "shadow-[inset_#1eb99d_0_0_0_3px,rgba(201,211,219,0.5)_20px_14px_24px]",
        highlight &&
          "shadow-[inset_#0000FF_0_0_0_3px,rgba(201,211,219,0.5)_20px_14px_24px]"
      )}
      aria-label="Droppable region"
    >
      <div className="absolute box-content text-[7rem] leading-none -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4"></div>
    </div>
  );
}

export default PersonAssignment;
