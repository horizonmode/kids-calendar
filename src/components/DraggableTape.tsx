import React, { CSSProperties, use, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import Tape from "./Tape";
import ResizeIcon from "./ResizeIcon";
import Editable from "./Editable";
import PersonAssignment from "./PersonAssignment";
import { RiRefreshLine } from "@remixicon/react";
import { EventItem } from "@/types/Items";
import { Handle } from "./Handle";

interface DraggableTapeProps {
  id: string;
  top?: string;
  left?: string;
  style?: CSSProperties;
  isStart: boolean;
  isEnd: boolean;
  eventId: string;
  locked?: boolean;
  showPeople?: boolean;
  people?: number[];
  loading?: boolean;
  onDelete?: () => void;
  onEditEvent?: (item: EventItem, action: "update" | "delete" | "move") => void;
  event: EventItem;
  useHandle?: boolean;
}

function DraggableTape({
  id,
  top,
  left,
  style,
  isStart,
  isEnd,
  eventId,
  locked = true,
  showPeople = false,
  people,
  loading = false,
  event,
  onEditEvent,
  useHandle = true,
}: DraggableTapeProps) {
  const [editingItem, setEditingItem] = useState<EventItem | null>(null);
  const editable = (editingItem && editingItem.id === event.id) || false;
  const item = editingItem && editingItem.id === event.id ? editingItem : event;
  const moveProps = useDraggable({
    id: id,
    data: {
      type: "event",
      action: "move",
      extra: {
        itemId: eventId,
        label: item.content,
        isStart,
        isEnd,
        color: item.color,
      },
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
      type: "event",
      action: "resize",
      extra: {
        itemId: eventId,
        label: item.content,
        isStart,
        isEnd,
        color: item.color,
      },
    },
    disabled: editable,
  });

  const resizeAttributes = resizeProps.attributes;
  const resizeListeners = resizeProps.listeners;
  const resizeSetNodeRef = resizeProps.setNodeRef;

  const onUpdateContent = (event: Partial<EventItem>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, ...event });
    }
  };

  const onDelete = async (event: EventItem) => {
    onEditEvent && onEditEvent(event, "delete");
    setEditingItem(null);
  };

  const onSelect = (item: EventItem) => {
    setEditingItem(item);
  };

  const onDeselect = async (item: EventItem) => {
    const newEvent = {
      ...event,
      ...editingItem,
    };

    onEditEvent && onEditEvent(newEvent, "update");
    setEditingItem(null);
  };

  return (
    <div
      id={id}
      ref={moveSetNodeRef}
      className="w-full flex-shrink-0 absolute"
      style={{
        opacity: moveIsDragging ? 0.5 : undefined,
        top: top,
        left: left,
        ...style,
      }}
      onClick={(e) => {
        if (!editable) {
          onSelect(event);
        }
      }}
      {...(!useHandle ? moveAttributes : {})}
      {...(!useHandle ? moveListeners : {})}
    >
      {isStart && useHandle && (
        <Handle
          style={{ left: -5, position: "absolute", zIndex: 100 }}
          className="bg-black pointer-events-auto"
          {...moveListeners}
        />
      )}
      {isStart && onSelect && (
        <Editable
          onDelete={() => onDelete(event)}
          onChangeColor={(color) => onUpdateContent({ color })}
          color={item.color}
          editable={editable}
          onSelect={(selected) => {
            if (selected) {
              onSelect(event);
            } else {
              onDeselect(event);
            }
          }}
          position="top"
          className={`pointer-events-auto ${locked ? "hidden" : ""}`}
        ></Editable>
      )}
      {showPeople && isStart && (
        <PersonAssignment
          id={eventId}
          peopleIds={people || []}
          disabled={moveType == null || moveType !== "people"}
          style={{ position: "absolute", bottom: "-35px", right: "0" }}
        />
      )}
      <Tape
        onUpdateContent={(content) => onUpdateContent({ content })}
        label={item.content || ""}
        isStart={isStart}
        isEnd={isEnd}
        color={item.color}
        editable={editable}
      ></Tape>
      {isEnd && loading ? (
        <RiRefreshLine className="absolute pointer-events-none right-0 -top-12 animate-spin" />
      ) : (
        isEnd && (
          <ResizeIcon
            ref={resizeSetNodeRef}
            listeners={resizeListeners}
            attributes={resizeAttributes}
            className="absolute pointer-events-auto right-0 -top-12"
          />
        )
      )}
    </div>
  );
}

export default DraggableTape;
