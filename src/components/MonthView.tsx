"use client";
import React, { CSSProperties, useState } from "react";
import Droppable from "@/components/Droppable";
import DraggableOverlay from "@/components/DraggableOverlay";
import {
  useCalendarStore,
  getDaysContent,
  getDaysEvents,
  Schedule,
} from "@/store/calendar";
import {
  rectIntersection,
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  closestCorners,
  Over,
  Active,
  DroppableContainer,
} from "@dnd-kit/core";

import NonDay from "./NonDay";
import { Days } from "@/utils/days";
import Toolbar from "./Toolbar";
import Text from "./Text";
import PostCard from "./PostCard";
import { RectMap } from "@dnd-kit/core/dist/store/types";
import {
  ClientRect,
  Coordinates,
  DragMoveEvent,
} from "@dnd-kit/core/dist/types";
import { Delta } from "./Delta";
import { EventItem, GenericItem } from "@/types/Items";
import Draggable from "./Draggable";
import Note from "./Note";
import { shallow } from "zustand/shallow";
import classNames from "classnames";
import Tape from "./Tape";
import DraggableTape from "./DraggableTape";
import Editable from "./Editable";

const days = new Days();
const today = new Date();

interface MonthViewProps {
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onRevert: () => void;
  onShare: () => void;
  saving: boolean;
}

const MonthView = ({
  onNext,
  onPrev,
  onSave,
  onRevert,
  onShare,
  saving,
}: MonthViewProps) => {
  const [
    currentDay,
    reorderDays,
    reorderEvents,
    editDay,
    deleteItem,
    deleteEvent,
    selectItem,
    deselectItem,
    setDay,
    editEvent,
    addDayContent,
    addEvent,
    content,
    events,
    toolbarItems,
    selectEvent,
    deselectEvent,
  ] = useCalendarStore(
    (state) => [
      state.selectedDay,
      state.reorderDays,
      state.reorderEvents,
      state.editDay,
      state.deleteItem,
      state.deleteEvent,
      state.selectItem,
      state.deselectItem,
      state.setSelectedDay,
      state.editEvent,
      state.addDayContent,
      state.addEvent,
      getDaysContent(state),
      getDaysEvents(state),
      state.toolbarItems,
      state.selectEvent,
      state.deselectEvent,
    ],
    shallow
  );

  const day = currentDay.getDate();
  const month = currentDay.getMonth();
  const year = currentDay.getFullYear();
  const daysInMonth = days.getDays(year, month);
  const firstDayOfMonth = days.getFirstDay(year, month);

  const onReorder = (itemId: string, overId: number, delta: Delta) => {
    if (itemId) reorderDays(itemId, overId, delta, day, month, year);
  };

  const onItemDrag = (over: Over, delta: Delta, activeItem: Active) => {
    const { type, action } = activeItem.data.current as any;

    if (!over) {
      return;
    }
    const destination = over.id.toString();
    const itemId = activeItem.id.toString();

    if (destination === "toolbar") return;

    if (type === "tape") {
      const { isStart, isEnd, itemId } = (activeItem.data.current as any).extra;
      onReorderEvent(
        itemId,
        parseInt(destination),
        isStart,
        isEnd,
        delta,
        action
      );
    } else {
      {
        onReorder(itemId, parseInt(destination), delta);
      }
    }
  };

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const activationConstraint = {
    delay: 50,
    tolerance: 2,
    distance: 4,
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    })
  );

  function customCollisionDetectionAlgorithm({
    droppableContainers,
    ...args
  }: {
    droppableContainers: DroppableContainer[];
    active: Active;
    collisionRect: ClientRect;
    droppableRects: RectMap;
    pointerCoordinates: Coordinates | null;
  }) {
    // First, let's see if the `trash` droppable rect is intersecting
    const rectIntersectionCollisions = rectIntersection({
      ...args,
      droppableContainers: droppableContainers.filter(
        ({ id }) => id === "toolbar"
      ),
    });

    // Collision detection algorithms return an array of collisions
    if (rectIntersectionCollisions.length > 0) {
      // The trash is intersecting, return early
      return rectIntersectionCollisions;
    }

    // Compute other collisions
    return closestCorners({
      ...args,
      droppableContainers: droppableContainers.filter(
        ({ id }) => id !== "trash"
      ),
    });
  }

  const onReorderEvent = (
    itemId: string,
    overId: number,
    isStart: boolean,
    isEnd: boolean,
    delta: Delta,
    action: string
  ) => {
    reorderEvents(
      itemId,
      overId,
      day,
      month,
      year,
      isStart,
      isEnd,
      delta,
      action
    );
  };

  const onItemEdit = (itemId: string, newItem: GenericItem) => {
    editDay(itemId, newItem);
  };

  const onItemDelete = (item: GenericItem) => {
    deleteItem(item.id);
  };

  const onEventDelete = (event: EventItem) => {
    deleteEvent(event.id);
  };

  const onItemSelect = (item: GenericItem) => {
    selectItem(item.id);
  };

  const calendarDays = daysInMonth + firstDayOfMonth - 1; // always show 7 days x 5 rows
  const offset = firstDayOfMonth - 1;

  const getStyle: (d: GenericItem) => CSSProperties = (d) => ({
    position: "absolute",
    zIndex: `${d.order + 2 * 10}`,
    transform: d.x === 0 && d.y === 0 ? "translate(-50%,-50%)" : "none",
  });

  const renderItems = (items: Schedule[]) => {
    return items.map((day, j) =>
      day.items.map((d, i) => {
        switch (d.type) {
          case "post-it":
            return (
              <Draggable
                id={d.id}
                key={`drag-postit-${d}-${i}`}
                left={`${d.x || 50 + i * 5}%`}
                top={`${d.y || 50 + i * 5}%`}
                element="post-it"
                style={getStyle(d)}
                data={{ content: d.content, color: d.color }}
                disabled={d.editable}
              >
                <Editable
                  onDelete={() => onItemDelete(d)}
                  color={d.color || "#0096FF"}
                  onChangeColor={(color: string) => {
                    onItemEdit(d.id, { ...d, color });
                  }}
                  onSelect={(selected) => {
                    if (selected) onItemSelect(d);
                    else deselectItem(d.id);
                  }}
                  editable={d.editable || false}
                >
                  <Note
                    editable={d.editable || false}
                    content={d.content}
                    onUpdateContent={(content: string) =>
                      onItemEdit(d.id, { ...d, content })
                    }
                    color={d.color}
                  />
                </Editable>
              </Draggable>
            );
          case "text":
            return (
              <Draggable
                id={d.id}
                key={`drag-text-${d.id}-${i}`}
                left={`${d.x || 50 + i * 5}%`}
                top={`${d.y || 50 + i * 5}%`}
                style={getStyle(d)}
                element="text"
                data={{ content: d.content, color: d.color }}
              >
                <Text
                  content={d.content}
                  onUpdateContent={(content) =>
                    onItemEdit(d.id, { ...d, content })
                  }
                  onDelete={() => onItemDelete(d)}
                  onSelect={() => onItemSelect(d)}
                  color={d.color}
                  onChangeColor={(color) => {
                    onItemEdit(d.id, { ...d, color });
                  }}
                ></Text>
              </Draggable>
            );
          case "post-card":
            return (
              <Draggable
                id={d.id}
                key={`drag-postcard-${d.id}-${i}`}
                left={`${d.x || 50 + i * 5}%`}
                top={`${d.y || 50 + i * 5}%`}
                style={getStyle(d)}
                element="post-card"
                data={{ content: d.content, fileUrl: d.file }}
                disabled={d.editable}
              >
                <Editable
                  onDelete={() => onItemDelete(d)}
                  color={d.color || "#0096FF"}
                  onChangeColor={(color: string) => {
                    onItemEdit(d.id, { ...d, color });
                  }}
                  onSelect={(selected) => {
                    if (selected) onItemSelect(d);
                    else deselectItem(d.id);
                  }}
                  editable={d.editable || false}
                >
                  <PostCard
                    key={`drag-postcard-${i}`}
                    id={d.id}
                    content={d.content}
                    editable={d.editable || false}
                    onUpdateContent={(content) =>
                      onItemEdit(d.id, { ...d, content })
                    }
                    onFileChange={(file) => onItemEdit(d.id, { ...d, file })}
                    fileUrl={d.file}
                  ></PostCard>
                </Editable>
              </Draggable>
            );
        }
      })
    );
  };

  const [delta, setDelta] = useState<Delta | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [dragAction, setDragAction] = useState<string | null>(null);

  const updateDragState = (e: DragMoveEvent) => {
    const { activatorEvent, delta: deltaChange, over, active } = e;
    if (!over) return;
    const el = activatorEvent.target as HTMLElement;
    var rect = el.getBoundingClientRect();
    const x = (rect.x + deltaChange.x - over.rect.left) / over.rect.width;
    const y = (rect.y + deltaChange.y - over.rect.top) / over.rect.height;
    const overAsInt = over ? parseInt(over.id.toString()) : null;
    setOver(overAsInt);
    setDragId(e?.active?.data?.current?.extra.itemId);
    setDragAction(e?.active?.data?.current?.action);
    setDelta({ x, y });
  };

  return (
    <DndContext
      id="droppable"
      autoScroll={false}
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm}
      onDragOver={updateDragState}
      onDragMove={updateDragState}
      onDragStart={(e) => {
        setIsDragging(true);
      }}
      onDragCancel={(e) => {
        setIsDragging(false);
      }}
      onDragEnd={({ over, delta, active, activatorEvent }) => {
        const translated = active.rect.current.translated;
        if (!translated) return;
        setIsDragging(false);
        if (!over) return;
        const x = (translated.left - over.rect.left) / over.rect.width;
        const y = (translated.top - over.rect.top) / over.rect.height;
        onItemDrag(over, { x, y }, active);
      }}
    >
      {/* <PersonSelect /> */}
      <div className="flex-1 w-full h-full grid grid-cols-1 md:grid-cols-7 relative max-h-screen overflow:auto">
        <h2 className="text-center hidden md:block mb-3">Monday</h2>
        <h2 className="text-center hidden md:block mb-3">Tuesday</h2>
        <h2 className="text-center hidden md:block mb-3">Wednesday</h2>
        <h2 className="text-center hidden md:block mb-3">Thursday</h2>
        <h2 className="text-center hidden md:block mb-3">Friday</h2>
        <h2 className="text-center hidden md:block mb-3">Saturday</h2>
        <h2 className="text-center hidden md:block mb-3">Sunday</h2>
        {[...Array(calendarDays)].map((_, i) => {
          const isRowStart = i % 7 === 0;
          const offsetDay = i + 1 - offset;
          if (offsetDay >= 1 && offsetDay <= daysInMonth)
            return (
              <Droppable
                day={offsetDay}
                key={`drop-${i}`}
                id={offsetDay.toString()}
                dragging={isDragging}
                isPast={
                  offsetDay < today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear()
                }
                isToday={
                  offsetDay === today.getDate() &&
                  month === today.getMonth() &&
                  year === today.getFullYear()
                }
                highlight={currentDay.getDate() === offsetDay}
                onClick={() => {
                  setDay(new Date(currentDay.setDate(offsetDay)));
                }}
              >
                {renderItems(
                  content.filter(
                    (d1) =>
                      d1.day === offsetDay && d1.items && d1.items.length > 0
                  )
                )}
              </Droppable>
            );
          else return <NonDay key={`non-${i}`}></NonDay>;
        })}
        <div
          className={classNames(
            "flex-1 w-full h-full grid grid-cols-1 md:grid-cols-7 pointer-events-none absolute top-0 left-0"
          )}
        >
          <h2 className="text-center hidden md:block mb-3 opacity-0">Monday</h2>
          <h2 className="text-center hidden md:block mb-3 opacity-0">
            Tuesday
          </h2>
          <h2 className="text-center hidden md:block mb-3 opacity-0">
            Wednesday
          </h2>
          <h2 className="text-center hidden md:block mb-3 opacity-0">
            Thursday
          </h2>
          <h2 className="text-center hidden md:block mb-3 opacity-0">Friday</h2>
          <h2 className="text-center hidden md:block mb-3 opacity-0">
            Saturday
          </h2>
          <h2 className="text-center hidden md:block mb-3 opacity-0">Sunday</h2>
          {[...Array(calendarDays)].map((_, i) => {
            const offsetDay = i + 1 - offset;
            if (!(offsetDay >= 1 && offsetDay <= daysInMonth))
              return <NonDay key={`events-${offsetDay}`} />;
            const todayEvents = events.filter(
              (e) => offsetDay >= e.day && offsetDay < e.day + e.days
            );
            if (!todayEvents) return null;
            const draggedItem = isDragging
              ? events.find((te) => te.id === dragId)
              : null;

            const isDraggedHighlight =
              dragAction === "move"
                ? isDragging &&
                  draggedItem &&
                  over &&
                  offsetDay >= over &&
                  offsetDay < over + draggedItem.days
                : isDragging &&
                  draggedItem &&
                  offsetDay >= draggedItem?.day &&
                  over &&
                  offsetDay <= over;

            return (
              <div
                key={`events-${offsetDay}`}
                className={`aspect-square flex flex-col items-stretch justify-center relative isolate ${
                  isDraggedHighlight && " border-cyan-700 border-2"
                }`}
              >
                {todayEvents.map((event, i) => {
                  const isStart = event && event.day === offsetDay;
                  const isEnd =
                    event && offsetDay === event.day + event.days - 1;
                  const isForToday =
                    offsetDay >= 0 && offsetDay < daysInMonth + 1;
                  if (!isForToday) return null;
                  return isStart || isEnd ? (
                    <DraggableTape
                      key={`event-${offsetDay}-${i}`}
                      id={`tape-${event.id}-${isStart ? "start" : "end"}`}
                      left={`0%`}
                      top={`${event.y}%`}
                      onUpdateContent={(e: string) =>
                        editEvent(event.id, { ...event, content: e })
                      }
                      isStart={event.day === offsetDay}
                      isEnd={offsetDay === event.day + event.days - 1}
                      label={event.content || event.label}
                      eventId={event.id}
                      style={{
                        position: "absolute",
                        zIndex: event.order + 2,
                        opacity: isDragging && dragId === event.id ? "0" : "1",
                      }}
                      onSelect={(selected) => {
                        console.log("selected", selected);
                        if (selected) selectEvent(event.id);
                        else deselectEvent(event.id);
                      }}
                      editable={event.editable}
                      onDelete={() => onEventDelete(event)}
                      onChangeColor={(e) =>
                        editEvent(event.id, { ...event, color: e })
                      }
                      color={event.color}
                    />
                  ) : (
                    <Tape
                      key={`event-${offsetDay}-${i}`}
                      isEnd={false}
                      isStart={false}
                      label=""
                      top={`${event.y}%`}
                      color={event.color || "blue"}
                      style={{
                        position: "absolute",
                        zIndex: event.order + 2,
                        opacity: isDragging && dragId === event.id ? "0" : "1",
                      }}
                    />
                  );
                })}
                {isDraggedHighlight && draggedItem && (
                  <Tape
                    key={`event-${offsetDay}-${i}`}
                    color={draggedItem.color}
                    style={{
                      position: "absolute",
                      zIndex: 20,
                      opacity: "0.75",
                    }}
                    left={`0%`}
                    top={`${
                      (dragAction === "move" && (delta?.y || 0) * 100) ||
                      draggedItem?.y
                    }%`}
                    isStart={false}
                    isEnd={false}
                    label=""
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Toolbar
        toolbarItems={toolbarItems}
        onNext={onNext}
        onPrev={onPrev}
        onSave={onSave}
        onShare={onShare}
        saving={saving}
        showNav={true}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default MonthView;
