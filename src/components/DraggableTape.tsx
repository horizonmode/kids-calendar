import React, { CSSProperties } from "react";
import { useDraggable } from "@dnd-kit/core";
import Tape from "./Tape";
import ResizeIcon from "./ResizeIcon";
import Editable from "./Editable";
import PersonAssignment from "./PersonAssignment";
import { Person } from "@/types/Items";

interface DraggableTapeProps {
  id: string;
  top?: string;
  left?: string;
  style?: CSSProperties;
  isStart: boolean;
  isEnd: boolean;
  label?: string;
  eventId: string;
  editable?: boolean;
  color?: string;
  locked?: boolean;
  showPeople?: boolean;
  people?: Person[];
  onUpdateContent?: (val: string) => void;
  onDelete?: () => void;
  onChangeColor?: (val: string) => void;
  onSelect?: (selected: boolean) => void;
}

function DraggableTape({
  id,
  top,
  left,
  style,
  isStart,
  isEnd,
  label,
  eventId,
  editable,
  color = "#0000ff",
  locked = true,
  showPeople = false,
  people,
  onUpdateContent,
  onDelete,
  onChangeColor,
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
  const moveType = moveProps.active?.data?.current?.type;

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
      {isStart && onSelect && (
        <Editable
          onDelete={onDelete}
          onChangeColor={onChangeColor}
          color={color}
          editable={editable || false}
          onSelect={onSelect}
          position="top"
          className={`pointer-events-auto ${locked ? "hidden" : ""}`}
        ></Editable>
      )}
      {showPeople && (
        <PersonAssignment
          id={eventId}
          people={people || []}
          disabled={moveType == null || moveType !== "person"}
          style={{ position: "absolute", bottom: "-35px", right: "0" }}
        />
      )}
      <Tape
        onUpdateContent={onUpdateContent}
        label={label || ""}
        isStart={isStart}
        isEnd={isEnd}
        color={color}
        editable={editable}
      ></Tape>
      {isEnd && (
        <ResizeIcon
          ref={resizeSetNodeRef}
          listeners={resizeListeners}
          attributes={resizeAttributes}
          className="absolute pointer-events-auto right-0 -top-12"
        />
      )}
    </div>
  );
}

export default DraggableTape;
