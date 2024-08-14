import React, { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import Tape from "./Tape";
import ResizeIcon from "./ResizeIcon";
import Editable from "./Editable";

interface DraggableTapeProps {
  id: string;
  top?: string;
  left?: string;
  style?: CSSProperties;
  onUpdateContent?: (val: string) => void;
  onDelete?: () => void;
  isStart: boolean;
  isEnd: boolean;
  label?: string;
  eventId?: string;
  onChangeColor?: (val: string) => void;
  color?: string;
  editable?: boolean;
  onSelect?: (selected: boolean) => void;
}

function DraggableTape({
  id,
  top,
  left,
  style,
  onUpdateContent,
  onDelete,
  isStart,
  isEnd,
  label,
  eventId,
  onChangeColor,
  color = "#0000ff",
  editable,
  onSelect,
}: DraggableTapeProps) {
  const moveProps = useDraggable({
    id: id,
    data: {
      type: "tape",
      action: "move",
      extra: { itemId: eventId, label, isStart, isEnd, color },
    },
    disabled: editable,
  });

  const moveAttributes = moveProps.attributes;
  const moveListeners = moveProps.listeners;
  const moveSetNodeRef = moveProps.setNodeRef;
  const moveIsDragging = moveProps.isDragging;
  const moveTransform = moveProps.transform;

  const resizeProps = useDraggable({
    id: `${id}-resize`,
    data: {
      type: "tape",
      action: "resize",
      extra: { itemId: eventId, label, isStart, isEnd },
    },
    disabled: editable,
  });

  const resizeAttributes = resizeProps.attributes;
  const resizeListeners = resizeProps.listeners;
  const resizeSetNodeRef = resizeProps.setNodeRef;

  return (
    <div
      id={id}
      ref={moveSetNodeRef}
      className="w-full flex-shrink-0"
      {...moveListeners}
      {...moveAttributes}
      style={{
        opacity: moveIsDragging ? 0.5 : undefined,
        top: top,
        left: left,
        position: "absolute",
        ...style,
      }}
    >
      <Tape
        onUpdateContent={onUpdateContent}
        label={label || ""}
        isStart={isStart}
        isEnd={isEnd}
        color={color}
        editable={editable}
      >
        {isStart && onSelect && (
          <Editable
            onDelete={onDelete}
            onChangeColor={onChangeColor}
            color={color}
            editable={editable || false}
            onSelect={onSelect}
          ></Editable>
        )}
        {isEnd && (
          <ResizeIcon
            ref={resizeSetNodeRef}
            listeners={resizeListeners}
            attributes={resizeAttributes}
            className={"-right-8"}
          />
        )}
      </Tape>
    </div>
  );
}

export default DraggableTape;
