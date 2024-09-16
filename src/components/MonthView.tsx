"use client";
import {
  startTransition,
  use,
  useActionState,
  useEffect,
  useOptimistic,
} from "react";
import React, { CSSProperties, useState } from "react";
import classNames from "classnames";
import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import Droppable from "@/components/Droppable";
import {
  CalendarDay,
  EventItem,
  GenericItem,
  ItemType,
  PostCardItem,
} from "@/types/Items";
import { RectMap } from "@dnd-kit/core/dist/store/types";
import { MouseSensor, TouchSensor } from "@/utils/handlers";
import DraggableOverlay from "@/components/DraggableOverlay";
import {
  ClientRect,
  Coordinates,
  DragMoveEvent,
} from "@dnd-kit/core/dist/types";
import { useCalendarContext } from "@/store/calendar";
import {
  Active,
  closestCorners,
  DndContext,
  DroppableContainer,
  Over,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  restrictToFirstScrollableAncestor,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import Note from "./Note";
import Tape from "./Tape";
import NonDay from "./NonDay";
import Toolbar from "./Toolbar";
import { Delta } from "./Delta";
import PostCard from "./PostCard";
import Editable from "./Editable";
import Draggable from "./Draggable";
import PersonSelect from "./PersonSelect";
import DraggableTape from "./DraggableTape";
import PersonAssignment from "./PersonAssignment";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";
import calendarService from "@/helpers/calendarService";
import usePersonContext from "@/store/people";
import {
  updateDayAction,
  UpdateDaysAction,
  updateDaysAction,
} from "@/helpers/serverActions/days";
import { updateEventsAction } from "@/helpers/serverActions/events";
import { useServerAction } from "@/hooks/useServerAction";
import useSync from "@/hooks/useSync";
import CalendarCell from "./CalendarCell";
import useOptimisticCalendarDays from "@/hooks/useOptimisticCalendarDays";
const { reorderDays, reorderEvents } = calendarService;

const days = new Days();
const today = new Date();

interface MonthViewProps {
  onNext: () => void;
  onPrev: () => void;
  onRevert: () => void;
  onShare: () => void;
  calendarId: string;
}

const MonthView = ({ onNext, onPrev, onShare, calendarId }: MonthViewProps) => {
  const [
    currentDay,
    editDay,
    deleteItem,
    deleteEvent,
    selectItem,
    setSelectedDay,
    editEvent,
    content,
    events,
    pendingChanges,
    toolbarItems,
    selectEvent,
    deselectEvent,
    assignPerson,
    removePerson,
    locked,
    setLocked,
    setDays,
    setEvents,
  ] = useCalendarContext(
    (state) => [
      state.selectedDay,
      state.editDay,
      state.deleteItem,
      state.deleteEvent,
      state.selectItem,
      state.setSelectedDay,
      state.editEvent,
      calendarService.getDaysContent(state.days, state.selectedDay),
      calendarService.getDaysEvents(state.events, state.selectedDay),
      state.pendingChanges,
      state.toolbarItems,
      state.selectEvent,
      state.deselectEvent,
      state.assignPerson,
      state.removePerson,
      state.locked,
      state.setLocked,
      state.setDays,
      state.setEvents,
    ],
    shallow
  );

  const [people, pendingPeoplechanges, showPeople, setShowPeople] =
    usePersonContext((state) => [
      state.getActivePeople(),
      state.pendingChanges,
      state.showPeople,
      state.setShowPeople,
    ]);

  const [updateEvents, isEventsPending] = useServerAction(updateEventsAction);
  const saving = isEventsPending;

  const month = currentDay.getMonth();
  const year = currentDay.getFullYear();
  const daysInMonth = days.getDays(year, month);
  const firstDayOfMonth =
    days.getFirstDay(year, month) === 0 ? 7 : days.getFirstDay(year, month);

  const { calendarDays: calDays, setCalendarDays } =
    useOptimisticCalendarDays(content);

  const onReorder = async (itemId: string, overId: number, delta: Delta) => {
    if (itemId) {
      const reorder = reorderDays(
        itemId,
        overId,
        delta,
        month,
        year,
        calDays,
        toolbarItems
      );
      console.log("reorder", reorder);
      startTransition(() => {
        setCalendarDays({
          sourceDay: reorder.sourceDay,
          targetDay: reorder.targetDay,
          targetItemIndex: reorder.targetItemIndex,
          action: "move",
        });
      });
      await updateDaysAction(
        calendarId,
        [reorder.sourceDay, reorder.targetDay],
        "/grids/"
      );
    }
  };

  const onItemDrag = (over: Over, delta: Delta, activeItem: Active) => {
    const { type, action } = activeItem.data.current as {
      type: ItemType;
      action: string;
    };
    if (!over) {
      return;
    }

    const destination = over.id.toString();
    const itemId = activeItem.id.toString();

    if (destination === "toolbar") return;

    if (type === "event") {
      if (destination === "toolbar-person") return;
      const { isStart, isEnd, itemId } = (activeItem.data.current as any).extra;
      onReorderEvent(
        itemId,
        parseInt(destination),
        isStart,
        isEnd,
        delta,
        action
      );
    } else if (type === "people") {
      const { itemId } = (activeItem.data.current as any).extra;
      const person = people.find((p) => p.id === parseInt(itemId));
      if (!person) return;
      if (destination === "toolbar-person") {
        const { sourceId } = (activeItem.data.current as any).extra;
        removePerson(sourceId, person);
      } else {
        console.log("assigning person", destination, person);
        assignPerson(destination, person);
      }
    } else {
      if (destination === "toolbar-person") return;
      onReorder(itemId, parseInt(destination), delta);
    }
  };

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const activationConstraint = {
    delay: 0,
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
    // First, let's see if the `toolbar` droppable rect is intersecting
    const rectIntersectionCollisions = rectIntersection({
      ...args,
      droppableContainers: droppableContainers.filter(
        ({ id }) => id === "toolbar"
      ),
    });

    // Collision detection algorithms return an array of collisions
    if (rectIntersectionCollisions.length > 0) {
      // The toolbar is intersecting, return early
      return rectIntersectionCollisions;
    }

    // Compute other collisions
    return closestCorners({
      ...args,
      droppableContainers: droppableContainers.filter(
        ({ id }) => id !== "toolbar"
      ),
    });
  }

  const onReorderEvent = async (
    itemId: string,
    overId: number,
    isStart: boolean,
    isEnd: boolean,
    delta: Delta,
    action: string
  ) => {
    const reorderedEvents = reorderEvents(
      events,
      itemId,
      overId,
      month,
      year,
      isStart,
      isEnd,
      delta,
      action,
      toolbarItems,
      currentDay
    );
    setEvents(reorderedEvents.events);
    await updateEvents(calendarId, reorderedEvents.events);
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

  const [delta, setDelta] = useState<Delta | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [dragType, setDragType] = useState<ItemType | null>(null);
  const [dragAction, setDragAction] = useState<string | null>(null);
  const { isPending } = useSync(calendarId);

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
    setDragType(e?.active?.data?.current?.type);
    setDragAction(e?.active?.data?.current?.action);
    setDelta({ x, y });
  };

  const [setShowModal] = useModalContext(
    (state) => [state.setShowModal],
    shallow
  );

  const peopleMenuActive = content.length > 0 || events.length > 0;

  const onDayEdit = async (
    day: CalendarDay,
    itemIndex: number,
    action: "move" | "delete" | "update"
  ) => {
    console.log("setting transition", day, itemIndex, action);
    startTransition(() => {
      setCalendarDays({
        sourceDay: day,
        targetDay: day,
        targetItemIndex: itemIndex,
        action,
      });
    });
    await updateDayAction(calendarId, day, "/grids/");
  };

  return (
    <DndContext
      id="droppable"
      autoScroll={false}
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm}
      modifiers={[restrictToFirstScrollableAncestor]}
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
      <PersonSelect
        people={people}
        showUsers={showPeople}
        onToggleShowPeople={() => setShowPeople(!showPeople)}
        addPerson={() => setShowModal("people")}
        disabled={!peopleMenuActive || (isDragging && dragType !== "people")}
      ></PersonSelect>
      <div className="flex-1 w-full h-full grid grid-cols-1 md:grid-cols-7 relative overflow:hidden select-none p-3">
        <h2 className="text-center hidden md:block mb-3">Monday</h2>
        <h2 className="text-center hidden md:block mb-3">Tuesday</h2>
        <h2 className="text-center hidden md:block mb-3">Wednesday</h2>
        <h2 className="text-center hidden md:block mb-3">Thursday</h2>
        <h2 className="text-center hidden md:block mb-3">Friday</h2>
        <h2 className="text-center hidden md:block mb-3">Saturday</h2>
        <h2 className="text-center hidden md:block mb-3">Sunday</h2>
        {[...Array(calendarDays)].map((_, i) => {
          const offsetDay = i + 1 - offset;
          if (offsetDay >= 1 && offsetDay <= daysInMonth) {
            const day = calDays.find((d) => d.day === offsetDay);
            const dateOfOffset = new Date(year, month, offsetDay);
            return (
              <CalendarCell
                key={`day-${i}`}
                data={calDays.find((d1) => d1.day === offsetDay)}
                month={month}
                year={year}
                day={offsetDay}
                isDragging={isDragging}
                showPeople={showPeople}
                selected={currentDay.getDate() === offsetDay}
                onSelectDay={() => {
                  setSelectedDay(dateOfOffset);
                }}
                onEditDay={async (day, itemIndex, action) => {
                  await onDayEdit(day, itemIndex, action);
                }}
                disableDrag={
                  !isDragging || (isDragging && dragType === "people")
                }
                disablePeopleDrag={
                  !isDragging || (isDragging && dragType !== "people")
                }
              />
            );
          } else return <NonDay key={`non-${i}`}></NonDay>;
        })}
        <div
          className={classNames(
            "flex-1 w-full h-full grid grid-cols-1 md:grid-cols-7 pointer-events-none absolute top-0 left-0 p-3"
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
                      label={event.content}
                      eventId={event.id}
                      style={{
                        position: "absolute",
                        zIndex: event.order + 2,
                        opacity: isDragging && dragId === event.id ? "0" : "1",
                      }}
                      onSelect={(selected) => {
                        if (selected) selectEvent(event.id);
                        else deselectEvent(event.id);
                      }}
                      editable={event.editable}
                      onDelete={() => onEventDelete(event)}
                      onChangeColor={(e) =>
                        editEvent(event.id, { ...event, color: e })
                      }
                      color={event.color}
                      locked={locked}
                      showPeople={showPeople}
                      people={event.people}
                    ></DraggableTape>
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
        saving={isPending}
        toolbarItems={toolbarItems}
        onNext={onNext}
        onPrev={onPrev}
        onShare={onShare}
        onToggleLock={() => setLocked(!locked)}
        showNav={true}
        locked={locked}
        pendingChanges={pendingChanges > 0 || pendingPeoplechanges > 0}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default MonthView;
