import React, { CSSProperties, ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Handle } from "./Handle";

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
  handle?: boolean;
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
  handle = false,
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
      {...(handle ? {} : listeners)}
      {...(handle ? {} : attributes)}
      style={{
        opacity: isDragging ? 0 : 1,
        top: top,
        left: left,
        position: "absolute",
        touchAction: "none",
        ...style,
      }}
    >
      {handle ? (
        <Handle
          style={{ right: 0, top: 0, position: "absolute", zIndex: 50 }}
          className="bg-black"
          {...(handle ? listeners : {})}
        />
      ) : null}
      {children}
    </div>
  );
}

export default Draggable;
