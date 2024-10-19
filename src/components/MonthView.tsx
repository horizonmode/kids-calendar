"use client";
import { startTransition, useCallback, useEffect, useRef } from "react";
import React, { useState } from "react";
import classNames from "classnames";
import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import {
  CalendarDay,
  EventItem,
  GenericItem,
  GroupItem,
  ItemType,
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
  closestCenter,
  closestCorners,
  CollisionDetection,
  DndContext,
  DroppableContainer,
  getFirstCollision,
  Over,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  restrictToFirstScrollableAncestor,
  restrictToParentElement,
} from "@dnd-kit/modifiers";

import Tape from "./Tape";
import NonDay from "./NonDay";
import Toolbar from "./Toolbar";
import { Delta } from "./Delta";
import PersonSelect from "./PersonSelect";
import DraggableTape from "./DraggableTape";
import useModalContext from "@/store/modals";
import calendarService from "@/utils/calendarService";
import usePersonContext from "@/store/people";
import { updateDayAction, updateDaysAction } from "@/serverActions/days";
import { updateEventAction } from "@/serverActions/events";
import CalendarCell from "./CalendarCell";
import useOptimisticCalendarDays from "@/hooks/useOptimisticCalendarDays";
import useOptimisticEvents from "@/hooks/useOptimisticEvents";
import useGroupContext from "@/store/groups";
import { v4 as uuidv4 } from "uuid";
const {
  reorderDays,
  reorderEvents,
  toolbarItems,
  addPersonIfNotExists,
  removePersonIfExists,
  findItemType,
  reorderGroups,
  rebuildCalendarDays,
  findItem,
} = calendarService;

const days = new Days();

interface MonthViewProps {
  onNext: () => void;
  onPrev: () => void;
  onRevert: () => void;
  calendarId: string;
}

const MonthView = ({ onNext, onPrev, calendarId }: MonthViewProps) => {
  const [
    currentDay,
    setSelectedDay,
    content,
    events,
    locked,
    setLocked,
    selectedGroup,
    setSelectedGroup,
    setDays,
  ] = useCalendarContext(
    (state) => [
      state.selectedDay,
      state.setSelectedDay,
      calendarService.getDaysContent(state.days, state.selectedDay),
      calendarService.getDaysEvents(state.events, state.selectedDay),
      state.locked,
      state.setLocked,
      state.selectedGroup,
      state.setSelectedGroup,
      state.setDays,
    ],
    shallow
  );

  const [people, showPeople, setShowPeople] = usePersonContext((state) => [
    state.people,
    state.showPeople,
    state.setShowPeople,
  ]);

  const [setGroupEditing, resetGroups, editingGroupId, editingGroupItem] =
    useGroupContext(
      (state) => [state.setEditing, state.reset, state.groupId, state.item],
      shallow
    );

  const month = currentDay.getMonth();
  const year = currentDay.getFullYear();
  const daysInMonth = days.getDays(year, month);
  const firstDayOfMonth =
    days.getFirstDay(year, month) === 0 ? 7 : days.getFirstDay(year, month);

  const { calendarDays: calDays, setCalendarDays } =
    useOptimisticCalendarDays(content);

  const updateDays = async (
    sourceDay: CalendarDay | null,
    targetDay: CalendarDay,
    targetItemIndex: number
  ) => {
    startTransition(() => {
      setCalendarDays({
        sourceDay: sourceDay,
        targetDay: targetDay,
        targetItemIndex: targetItemIndex,
        action: "move",
      });
    });

    const updates = [targetDay];
    if (sourceDay && sourceDay.day !== targetDay.day) updates.push(sourceDay);

    await updateDaysAction(calendarId, updates, "/grids/");
  };

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

      await updateDays(
        reorder.sourceDay,
        reorder.targetDay,
        reorder.targetItemIndex
      );
    }
  };

  const { calendarEvents, setEvents: setCalEvents } =
    useOptimisticEvents(events);

  const onDayEdit = async (
    day: CalendarDay,
    itemIndex: number,
    action: "move" | "delete" | "update"
  ) => {
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

  const onEventEdit = async (
    event: EventItem,
    action: "update" | "delete" | "move"
  ) => {
    startTransition(() => {
      setCalEvents({
        event,
        events: calendarEvents,
        action,
      });
    });

    switch (action) {
      case "update":
        await updateEventAction(calendarId, event, "/grids/");
        break;
      case "delete":
        event.action = "delete";
        await updateEventAction(calendarId, event, "/grids/");
        break;
    }
  };

  const onReorderEvent = async (
    itemId: string,
    overId: number,
    isStart: boolean,
    isEnd: boolean,
    delta: Delta,
    action: string
  ) => {
    const { events, event } = reorderEvents(
      calendarEvents,
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
    startTransition(() => {
      setCalEvents({ event, events, action: "move" });
    });
    await updateEventAction(calendarId, event, "/grids/");
  };

  const onItemDrag = async (over: Over, delta: Delta, activeItem: Active) => {
    const { type, action } = activeItem.data.current as {
      type: ItemType;
      action: string;
    };
    if (!over || !activeItem) {
      return;
    }

    const destinationType = over.data.current?.type;
    const destination = over.id.toString();
    const itemId = activeItem.id.toString();

    if (destination === "toolbar") return;
    const targetGroup = findGroup(destination)?.id || editingGroupId;

    if (targetGroup) {
      await onDropGroup(targetGroup, itemId, over.id.toString(), delta);
      resetGroups();
      return;
    }

    if (type === "event") {
      if (destination === "toolbar-person") return;
      const { isStart, isEnd, itemId } = (activeItem.data.current as any).extra;
      await onReorderEvent(
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
      if (!person) throw new Error("Person not found");
      if (destination === "toolbar-person") {
        const { sourceId } = (activeItem.data.current as any).extra;
        const { type, itemIndex, dayIndex, eventIndex } = findItemType(
          sourceId,
          calDays,
          events
        );
        if (type === "day" && dayIndex != null && itemIndex != null) {
          const day = content[dayIndex];
          const item = day.items[itemIndex];
          removePersonIfExists(item, person);
          await onDayEdit(day, itemIndex, "update");
        } else if (type === "event" && eventIndex != null) {
          const event = events[eventIndex];
          removePersonIfExists(event, person);
          await onEventEdit(event, "update");
        }
      } else {
        const { type, itemIndex, dayIndex, eventIndex } = findItemType(
          destination,
          calDays,
          events
        );

        if (type === "day") {
          if (
            !type ||
            dayIndex === undefined ||
            dayIndex === -1 ||
            itemIndex === undefined ||
            itemIndex === -1
          )
            throw new Error("Invalid destination");
          const day = content[dayIndex];
          const item = day.items[itemIndex];
          addPersonIfNotExists(item, person);
          await onDayEdit(day, itemIndex, "update");
        } else if (type === "event") {
          if (!type || eventIndex === undefined || eventIndex === -1)
            throw new Error("Invalid destination");
          const event = events[eventIndex];
          addPersonIfNotExists(event, person);
          await onEventEdit(event, "update");
        }
      }
    } else {
      if (destination === "toolbar-person") return;
      await onReorder(itemId, parseInt(destination), delta);
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

  const calendarDays = daysInMonth + firstDayOfMonth - 1; // always show 7 days x 5 rows
  const offset = firstDayOfMonth - 1;

  const [delta, setDelta] = useState<Delta | null>(null);
  const [over, setOver] = useState<Over | null>(null);
  const [dragType, setDragType] = useState<ItemType | null>(null);
  const [dragAction, setDragAction] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [test, setTest] = useState<string | null>(null);

  const groups = calDays
    .filter((d) => d.items.length > 0)
    .map((d) => d.items)
    .flat()
    .filter((i) => i.type === "group") as GroupItem[];

  const isMovingGroup = activeId
    ? groups.find((g) => g.id === activeId)
      ? true
      : false
    : false;

  const isGroup = (id: string) => {
    return groups.find((g) => g.id === id);
  };

  const findGroup = (id: string) => {
    const group = groups.find((g) => g.id === id);
    if (group) return group;

    // look for the group that contains the item
    const groupItem = groups.find((g) =>
      (g as GroupItem).items.find((i) => i.id === id)
    );

    return groupItem;
  };

  const lastOverId = useRef<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    ({
      droppableContainers,
      ...args
    }: {
      droppableContainers: DroppableContainer[];
      active: Active;
      collisionRect: ClientRect;
      droppableRects: RectMap;
      pointerCoordinates: Coordinates | null;
    }) => {
      const activeId = args.active.id.toString();
      const cellDroppables = droppableContainers.filter(
        ({ id, data }) =>
          !isGroup(data.current?.groupId) &&
          !isGroupItem(id.toString()) &&
          id.toString() !== "toolbar" &&
          id.toString() !== "toolbar-person"
      );
      const groupDroppables = droppableContainers.filter(({ data }) =>
        isGroup(data.current?.groupId)
      );

      const toolbarDroppables = droppableContainers.filter(
        ({ id }) =>
          id.toString() === "toolbar" || id.toString() === "toolbar-person"
      );

      let overId = null;

      // If the active item is a group, return nearest item which isn't a group
      if (!isGroup(activeId)) {
        // If over a group, return that group droppable or nearest sortable inside
        const intersections = pointerWithin({
          ...args,
          droppableContainers: groupDroppables,
        });

        let overData = getFirstCollision(intersections, "data");
        const groupId = overData?.droppableContainer?.data?.current?.groupId;
        const groupDroppableId = overData?.droppableContainer?.id.toString();

        if (groupId) {
          let groupItems =
            groups.find((g) => g.id === groupId)?.items ||
            ([] as GenericItem[]);

          if (editingGroupId === groupId && editingGroupItem) {
            groupItems = [...groupItems, editingGroupItem];
          }
          if (groupItems && groupItems.length > 0) {
            // Return the closest droppable within that container
            const res = closestCenter({
              ...args,
              droppableContainers: droppableContainers.filter(
                (container) =>
                  container.id !== groupId &&
                  groupItems.find((item) => item.id === container.id)
              ),
            })[0]?.id;
            overId = res || groupDroppableId;
          } else {
            overId = groupDroppableId;
          }
        }
      }

      if (!overId) {
        // otherwise return a toolbar based on rect, or failing that
        // the closest cell
        overId = rectIntersection({
          ...args,
          droppableContainers: toolbarDroppables,
        })[0]?.id;

        if (!overId) {
          overId = closestCenter({
            ...args,
            droppableContainers: cellDroppables,
          })[0]?.id;
        }
      }

      if (overId) {
        lastOverId.current = overId.toString();
        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [groups, editingGroupId, editingGroupItem]
  );

  const updateDragState = (e: DragMoveEvent) => {
    const { activatorEvent, delta: deltaChange, over, active } = e;
    if (!over || !active) return;

    const el = activatorEvent.target as HTMLElement;
    var rect = el.getBoundingClientRect();
    const x = (rect.x + deltaChange.x - over.rect.left) / over.rect.width;
    const y = (rect.y + deltaChange.y - over.rect.top) / over.rect.height;
    setOver(over);
    setActiveId(active.id.toString());
    setDragId(e?.active?.data?.current?.extra?.itemId);
    setDragType(e?.active?.data?.current?.type);
    setDragAction(e?.active?.data?.current?.action);
    setDelta({ x, y });
    handleGroupDrag(over, active, { x, y });
  };

  const isGroupItem = (id: string) => {
    return groups.find((g) => g.items.find((i) => i.id === id));
  };

  useEffect(() => {
    if (editingGroupItem && over) {
      if (
        !isGroup(over.data?.current?.groupId) &&
        !isGroupItem(over?.id.toString()) &&
        editingGroupItem.id !== over?.id
      ) {
        resetGroups();
      }
    }
  }, [over, editingGroupItem]);

  const handleGroupDrag = (over: Over, active: Active, delta: Delta) => {
    if (isGroup(active.id.toString())) return;

    const groupId = over.data.current?.groupId;
    const overGroup = findGroup(groupId) || findGroup(over.id.toString());
    const activeGroup = findGroup(active.id.toString());

    if (!overGroup && !activeGroup) {
      return;
    }

    if (activeGroup && activeGroup.id === overGroup?.id) return;

    if (editingGroupItem) return;

    if (overGroup?.id !== activeGroup?.id) {
      if (overGroup) {
        // If we're moving to a group
        const itemId = active.id.toString();
        const sourceDayIndex = content.findIndex(
          (d) => d.items.findIndex((i) => i.id == itemId) > -1
        );
        let item = null;
        if (sourceDayIndex === -1) {
          // look in toolbarItems
          item = {
            ...toolbarItems.find((i) => i.id == itemId),
            // id: uuidv4().toString(),
          } as GenericItem;
        } else {
          item = content[sourceDayIndex].items.find((i) => i.id == itemId);
        }
        if (!item) throw new Error("Item not found");
        if (editingGroupId !== overGroup.id.toString()) {
          setGroupEditing(overGroup.id.toString(), item, "add");
        }
        return;
      } else if (activeGroup && !overGroup) {
        // If we're moving out of a group
        const itemId = active.id.toString();
        const item = activeGroup.items.find((i) => i.id == itemId);
        if (!item) throw new Error("Item not found");
        if (editingGroupId !== activeGroup.id.toString()) {
          setGroupEditing(activeGroup.id.toString(), item, "remove");
        }
      }
    }
  };

  const onDropGroup = async (
    groupId: string,
    itemId: string,
    overId: string,
    delta: Delta
  ) => {
    if (itemId) {
      const reorder = reorderGroups(
        itemId,
        groupId,
        overId,
        calDays,
        toolbarItems
      );
      startTransition(() => {
        setCalendarDays({
          sourceDay: reorder.sourceDay,
          targetDay: reorder.targetDay,
          targetItemIndex: reorder.targetItemIndex,
          action: "move",
        });
      });

      const updates = [reorder.targetDay];
      if (reorder.sourceDay && reorder.sourceDay.day !== reorder.targetDay.day)
        updates.push(reorder.sourceDay);

      await updateDaysAction(calendarId, updates, "/grids/");
    }
  };

  const [setActiveModals] = useModalContext(
    (state) => [state.setActiveModals],
    shallow
  );

  const peopleMenuActive = content.length > 0 || events.length > 0;

  return (
    <DndContext
      id="month-view"
      autoScroll={true}
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      modifiers={[]}
      onDragOver={updateDragState}
      // onDragMove={updateDragState}
      onDragStart={(e) => {
        setIsDragging(true);
        resetGroups();
      }}
      onDragCancel={() => {
        setIsDragging(false);
        resetGroups();
      }}
      onDragEnd={({ over, active }) => {
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
        addPerson={() => setActiveModals("people", true)}
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
                locked={locked}
                onEditDay={async (day, itemIndex, action) => {
                  await onDayEdit(day, itemIndex, action);
                }}
                disableDrag={
                  !isDragging || (isDragging && dragType === "people")
                }
                disablePeopleDrag={
                  !isDragging || (isDragging && dragType !== "people")
                }
                disableGroupSort={isDragging && isMovingGroup}
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
            const todayEvents = calendarEvents.filter(
              (e) => offsetDay >= e.day && offsetDay < e.day + e.days
            );
            if (!todayEvents) return null;

            const draggedItem = isDragging
              ? events.find((te) => te.id === dragId)
              : null;

            const overId = over?.id.toString();
            const overIdAsInt = parseInt(overId || "");

            const isDraggedHighlight =
              dragAction === "move"
                ? isDragging &&
                  draggedItem &&
                  over &&
                  offsetDay >= overIdAsInt &&
                  offsetDay < overIdAsInt + draggedItem.days
                : isDragging &&
                  draggedItem &&
                  offsetDay >= draggedItem?.day &&
                  over &&
                  offsetDay <= overIdAsInt;

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
                      isStart={event.day === offsetDay}
                      isEnd={offsetDay === event.day + event.days - 1}
                      eventId={event.id}
                      style={{
                        position: "absolute",
                        zIndex: event.order + 2,
                        opacity: isDragging && dragId === event.id ? "0" : "1",
                      }}
                      locked={locked}
                      showPeople={showPeople}
                      people={event.people}
                      loading={event.status === "pending"}
                      onEditEvent={async (event, action) => {
                        await onEventEdit(event, action);
                      }}
                      event={event}
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
        toolbarItems={toolbarItems}
        onNext={onNext}
        onPrev={onPrev}
        onShare={() => setActiveModals("share", true)}
        onToggleLock={() => setLocked(!locked)}
        showNav={true}
        locked={locked}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default MonthView;
