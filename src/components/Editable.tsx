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
}

const Editable = ({
  editable,
  onDelete,
  onSelect,
  onChangeColor,
  color,
  children,
}: EditableProps) => {
  return (
    <>
      {editable && (
        <div className="flex flex-row top-[-25px] right-[0] absolute z-10">
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
      {editable && (
        <input
          className="absolute -left-2 -bottom-12"
          onChange={(e) => {
            const { value } = e.target;
            onChangeColor && onChangeColor(value);
          }}
          type="color"
          name="color"
          value={color}
        />
      )}
      {children}
      {!editable && (
        <RiEditCircleFill
          className="top-[-25px] right-[0] absolute z-10"
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
