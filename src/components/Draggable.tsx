import React, { CSSProperties, ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

interface DraggableProps {
  element?: string;
  children?: ReactNode;
  id: string;
  style?: CSSProperties;
  left?: string;
  top?: string;
  data?: any;
  action?: "move" | "resize";
  disabled?: boolean;
}

function Draggable({
  element,
  children,
  id,
  style,
  left,
  top,
  data,
  action,
  disabled = false,
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      type: element,
      style,
      action,
      extra: { itemId: id, ...data },
    },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        opacity: isDragging ? 0 : 1,
        top: top,
        left: left,
        position: "absolute",
        touchAction: "manipulation",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Draggable;
