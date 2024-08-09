import React, { CSSProperties, ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableProps {
  element?: string;
  children?: ReactNode;
  id: string;
  style?: CSSProperties;
  left?: string;
  top?: string;
  data?: any;
  action?: "move" | "resize";
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
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: {
      type: element,
      style,
      action,
      extra: { itemId: id, ...data },
    },
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
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Draggable;
