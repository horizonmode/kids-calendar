"use client";
import { ReactNode } from "react";
import { RiDeleteBin6Line, RiCloseCircleLine } from "@remixicon/react";
import { icons } from "lucide-react";
import { Icon } from "./ui/Icon";

export interface Action {
  iconName: keyof typeof icons;
  onClick: () => void;
}

export interface EditableProps {
  editable: boolean;
  content?: string;
  onDelete?: () => void;
  onSelect: (selected: boolean) => void;
  onChangeColor?: (val: string) => void;
  color: string;
  className?: string;
  position?: "top" | "bottom" | "left" | "right";
  children?: ReactNode;
  actions?: Action[];
}

const Editable = ({
  editable,
  onDelete,
  onSelect,
  onChangeColor,
  color,
  className,
  position = "top",
  children,
  actions,
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
              onClick={(e) => {
                console.log("clicked");
              }}
              onChange={(e) => {
                const { value } = e.target;
                onChangeColor && onChangeColor(value);
              }}
              className={sizeClass}
              type="color"
              name="color"
            />
            {actions &&
              actions.map(({ iconName, onClick }, i) => (
                <div key={i} onClick={onClick}>
                  <Icon name={iconName} className={sizeClass} />
                </div>
              ))}
          </>
        )}
      </div>
      {children}
    </>
  );
};

export default Editable;
