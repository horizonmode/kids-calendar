"use client";
import { ReactNode } from "react";
import { RiEditCircleFill } from "@remixicon/react";
import { RiSave3Fill } from "@remixicon/react";
import { RiDeleteBin2Fill } from "@remixicon/react";

export interface EditableProps {
  editable: boolean;
  onDelete?: () => void;
  onSelect: (selected: boolean) => void;
  onChangeColor?: (val: string) => void;
  color: string;
  children?: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

const Editable = ({
  editable,
  onDelete,
  onSelect,
  onChangeColor,
  color,
  children,
  position = "top",
}: EditableProps) => {
  const positionClass =
    position === "top"
      ? "-top-12 -right-0 flex-row"
      : position === "right"
      ? "-right-12 -top-0 flex-col items-center justify-center"
      : "-bottom-12 -left-0 flex-row";
  return (
    <>
      {editable && (
        <div className={`flex absolute z-10 gap-2 ${positionClass}`}>
          <input
            onChange={(e) => {
              const { value } = e.target;
              onChangeColor && onChangeColor(value);
            }}
            type="color"
            name="color"
            value={color}
          />
          <RiDeleteBin2Fill
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete && onDelete();
            }}
          />
          <RiSave3Fill
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(false);
            }}
          />
        </div>
      )}

      {children}
      {!editable && (
        <RiEditCircleFill
          className={`absolute z-10 ${positionClass}`}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(true);
          }}
        />
      )}
    </>
  );
};

export default Editable;
