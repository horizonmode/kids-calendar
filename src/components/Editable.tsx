"use client";
import { ReactNode } from "react";
import { RiDeleteBin6Line, RiCloseCircleLine } from "@remixicon/react";

export interface EditableProps {
  editable: boolean;
  content?: string;
  onDelete?: () => void;
  onSelect: (selected: boolean) => void;
  onChangeColor?: (val: string) => void;
  color: string;
  children?: ReactNode;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  onUpdateContent?: (val: string) => void;
}

const Editable = ({
  editable,
  onDelete,
  onSelect,
  onChangeColor,
  color,
  children,
  className,
  position = "top",
  content = "initialContent",
  onUpdateContent,
}: EditableProps) => {
  const positionClass =
    position === "top"
      ? "-top-12 left-50 flex-row"
      : position === "right"
      ? "-right-12 -top-0 flex-col items-center justify-center"
      : position === "left"
      ? "-left-12 -top-0 flex-col items-center justify-center"
      : "-bottom-12 -right-12 flex-row";
  const sizeClass = "w-8 h-8";

  return (
    <>
      <div
        className={`flex absolute z-10 gap-2 bg-white p-1 ${positionClass} ${className}`}
      >
        {editable && (
          <>
            <RiCloseCircleLine
              className={sizeClass}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelect(false);
              }}
            />
            <RiDeleteBin6Line
              className={sizeClass}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete && onDelete();
              }}
            />
            <input
              onChange={(e) => {
                const { value } = e.target;
                onChangeColor && onChangeColor(value);
              }}
              className={sizeClass}
              type="color"
              name="color"
              value={color}
            />
          </>
        )}
      </div>
      {children}
    </>
  );
};

export default Editable;
