import React, { ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import classNames from "classnames";

interface DroppableProps {
  children: ReactNode;
  id: string;
  dragging: boolean;
  day?: number;
  onClick: () => void;
  highlight?: boolean;
  isToday: boolean;
  isPast: boolean;
}

function Droppable({
  children,
  id,
  dragging,
  day,
  onClick,
  highlight = false,
  isToday,
  isPast,
}: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      id={`droppable-${id}`}
      ref={setNodeRef}
      className={classNames(
        "items-center justify-center relative box-border bg-[#f0f0f1] transition-shadow duration-[250ms] ease-[ease] flex-1 aspect-[1] max-w-[100vh] grid grid-cols-[repeat(auto-fit,minmax(20px,max-content))] ml-0 mr-0.5 mt-0 mb-0.5",
        isOver &&
          "shadow-[inset_#1eb99d_0_0_0_3px,rgba(201,211,219,0.5)_20px_14px_24px]",
        highlight && "outline-[2px] outline-solid outline-white",
        isToday &&
          `bg-[white] after:pointer-events-none after:bg-[url('../assets/circle_free.png')] after:bg-contain after:bg-center after:content-[''] after:w-full after:h-full after:absolute after:z-0`,
        isPast &&
          `bg-[white] after:pointer-events-none after:bg-[url('../assets/cross.svg')] after:bg-contain after:opacity-25 after:bg-center after:content-[''] after:w-full after:h-full after:absolute after:z-0`
      )}
      aria-label="Droppable region"
      onClick={onClick}
    >
      {isPast && (
        <div className=" w-full absolute text-gray-300 opacity-25"></div>
      )}
      <span className="absolute box-content text-[7rem] leading-none -translate-x-2/4 -translate-y-2/4 left-2/4 top-2/4">
        {day}
      </span>
      {children}
    </div>
  );
}

export default Droppable;