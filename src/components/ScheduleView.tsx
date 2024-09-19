import React, { startTransition, useState } from "react";
import DraggableOverlay from "@/components/DraggableOverlay";
import {
  rectIntersection,
  DndContext,
  useSensors,
  useSensor,
  Over,
  Active,
  DragMoveEvent,
} from "@dnd-kit/core";
import { MouseSensor, TouchSensor } from "@/utils/handlers";
import { shallow } from "zustand/shallow";
import Toolbar from "./Toolbar";
import { useScheduleContext } from "@/store/schedule";
import {
  GenericItem,
  Person,
  ScheduleItem,
  ScheduleSection,
  Section,
} from "@/types/Items";
import { Delta } from "./Delta";
import PersonSelect from "./PersonSelect";
import usePersonContext from "@/store/people";
import useModalContext from "@/store/modals";
import useOptimisticSchedules from "@/hooks/useOptimisticWeekSchedules";
import WeekCell from "./WeekCell";
import { updateScheduleAction } from "@/serverActions/schedules";
import scheduleService from "@/utils/scheduleService";
const {
  reorderSchedule,
  toolbarItems,
  addPersonIfNotExists,
  removePersonIfExists,
  findItemInSchedules,
} = scheduleService;

interface ScheduleViewProps {
  year: number;
  week: number;
  templateId?: string;
  onNext: () => void;
  onPrev: () => void;
  onShare: () => void;
  calendarId: string;
}

const ScheduleView = ({
  year,
  week,
  templateId,
  onNext,
  onPrev,
  onShare,
  calendarId,
}: ScheduleViewProps) => {
  const { schedules } = useScheduleContext();

  const [people, showPeople, setShowPeople] = usePersonContext(
    (state) => [state.people, state.showPeople, state.setShowPeople],
    shallow
  );

  const [setShowModal] = useModalContext(
    (state) => [state.setShowModal],
    shallow
  );

  const assignPerson = async (destination: GenericItem, person: Person) => {
    addPersonIfNotExists(destination, person);
    await updateScheduleAction(calendarId, existingSchedule, "/grids/");
  };

  const removePerson = async (source: GenericItem, person: Person) => {
    removePersonIfExists(source, person);
    await updateScheduleAction(calendarId, existingSchedule, "/grids/");
  };

  const existingSchedule = schedules.find(
    (s) => s.year === year && s.week === week
  ) || { year, week, schedule: [], type: "schedule" };

  const onItemDrag = async (over: Over, delta: Delta, activeItem: Active) => {
    const [day, section] = over.id.toString().split("-");
    const sectionId = parseInt(section);
    const sectionName: Section =
      sectionId === 0 ? "morning" : sectionId === 1 ? "afternoon" : "evening";

    if (!over) {
      return;
    }
    const destination = over.id.toString();
    const itemId = activeItem.id;

    if (activeItem.data.current?.type === "people") {
      const { itemId } = (activeItem.data.current as any).extra;
      const person = people.find((p) => p.id === parseInt(itemId));
      if (!person) return;
      if (destination === "toolbar-person") {
        const { sourceId } = (activeItem.data.current as any).extra;
        removePerson(sourceId, person);
      } else {
        const item = findItemInSchedules(destination, [existingSchedule]);
        if (!item) throw new Error("Invalid Item");
        assignPerson(item, person);
      }
    } else {
      const {
        schedules: reorderSchedules,
        source,
        target,
      } = reorderSchedule(
        itemId.toString(),
        parseInt(day),
        sectionName,
        delta,
        year,
        week,
        schedules
      );

      if (!reorderSchedules || !target) throw new Error("Invalid");

      startTransition(() => {
        setSchedules({
          source,
          target,
          targetSection: sectionName,
          targetItemIndex: 0,
          action: "move",
        });
      });

      const newSchedule = source
        ? {
            ...existingSchedule,
            schedule: [
              ...existingSchedule.schedule.filter(
                (s) => s.day !== target.day && s.day !== source.day
              ),
              source,
              target,
            ],
          }
        : {
            ...existingSchedule,
            schedule: [
              ...existingSchedule.schedule.filter((s) => s.day !== target.day),
              target,
            ],
          };

      await updateScheduleAction(calendarId, newSchedule, "/grids/");
    }
  };

  const [{ algorithm }] = useState({
    algorithm: rectIntersection,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [locked, setLocked] = useState<boolean>(false);
  const [dragType, setDragType] = useState<string | null>(null);

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

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const sections: Section[] = ["morning", "afternoon", "evening"];

  function getDateOfWeek(w: number, y: number) {
    var d = 1 + (w - 1) * 7; // 1st of January + 7 days for each week

    return new Date(y, 0, d);
  }

  const day = getDateOfWeek(week, year);
  const labels = days.map((d, i) => {
    if (templateId) return d;
    const date = new Date(day);
    date.setDate(date.getDate() + i);
    return date.toLocaleDateString("en-US");
  });

  const updateDragState = (e: DragMoveEvent) => {
    const { activatorEvent, delta, over, collisions } = e;
    if (!over) return;
    const el = activatorEvent.target as HTMLElement;
    var rect = el.getBoundingClientRect();
    const x = (rect.x + delta.x - over.rect.left) / over.rect.width;
    const y = (rect.y + delta.y - over.rect.top) / over.rect.height;
    setDragType(e?.active?.data?.current?.type);
  };

  const { schedules: optimisticSchedules, setSchedules } =
    useOptimisticSchedules(existingSchedule.schedule);

  if (!existingSchedule) return null;

  const peopleMenuActive = existingSchedule?.schedule.some(
    (s) =>
      s.morning?.items?.length > 0 ||
      s.afternoon.items?.length > 0 ||
      s.evening.items?.length > 0
  );

  const onEditCell = async (
    day: number,
    section: Section,
    item: GenericItem,
    itemIndex: number,
    action: "move" | "update" | "delete"
  ) => {
    const scheduleIndex = existingSchedule.schedule.findIndex(
      (s) => s.day === day
    );
    if (scheduleIndex === -1) return;
    const scheduleItem = { ...optimisticSchedules[scheduleIndex] };

    switch (action) {
      case "update":
        scheduleItem[section].items[itemIndex] = item;
        break;
      case "delete":
        scheduleItem[section].items.splice(itemIndex, 1);
    }

    startTransition(() => {
      setSchedules({
        source: scheduleItem,
        target: scheduleItem,
        targetSection: section,
        targetItemIndex: itemIndex,
        action,
      });
    });

    const newSchedule = {
      ...existingSchedule,
      schedule: existingSchedule.schedule.map((s) =>
        s.day === day ? scheduleItem : s
      ),
    };

    await updateScheduleAction(calendarId, newSchedule, "/grids/");
  };

  return (
    <DndContext
      id="droppable"
      sensors={sensors}
      collisionDetection={algorithm}
      onDragOver={updateDragState}
      onDragMove={updateDragState}
      onDragStart={(e) => {
        setIsDragging(true);
      }}
      onDragCancel={(e) => {
        setIsDragging(false);
      }}
      onDragEnd={({ over, delta, active, activatorEvent, ...g }) => {
        const translated = active.rect.current.translated;
        if (!translated) return;
        setIsDragging(false);
        if (!over) return;
        const x = (translated.left - over.rect.left) / over.rect.width;
        const y = (translated.top - over.rect.top) / over.rect.height;
        onItemDrag(over, { x, y }, active);
      }}
    >
      <div className="w-full h-full relative flex flex-col md:grid md:grid-cols-7 p-3">
        {[...Array(7)].map((_, dayIndex) => {
          const dayItems = optimisticSchedules?.find(
            (s) => s.day === dayIndex + 1
          );
          return (
            <div
              className="flex flex-col items-stretch justify-stretch mb-5 md:mb-0"
              key={`day-${dayIndex}}`}
            >
              <h2 className="text-center mb-3">{labels[dayIndex]}</h2>
              <h3 className="text-center mb-3">{days[dayIndex]}</h3>
              {[...Array(3)].map((_, sectionIndex) => {
                const section = sections[sectionIndex];
                const sectionKey = section as keyof ScheduleItem;

                return (
                  <div key={`section-${dayIndex}-${sectionIndex}`}>
                    <WeekCell
                      data={
                        (dayItems && dayItems[sectionKey]
                          ? dayItems[sectionKey]
                          : []) as ScheduleSection
                      }
                      day={dayIndex}
                      section={section}
                      sectionIndex={sectionIndex}
                      isDragging={isDragging}
                      locked={locked}
                      showPeople={showPeople}
                      disableDrag={dragType === "people"}
                      disablePeopleDrag={dragType !== "people"}
                      onEditCell={(item, itemIndex, action) =>
                        onEditCell(
                          dayIndex + 1,
                          section,
                          item,
                          itemIndex,
                          action
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <PersonSelect
        people={people}
        showUsers={showPeople}
        onToggleShowPeople={() => setShowPeople(!showPeople)}
        addPerson={() => setShowModal("people")}
        disabled={!peopleMenuActive}
      ></PersonSelect>
      <Toolbar
        onNext={onNext}
        onPrev={onPrev}
        onToggleLock={() => setLocked(!locked)}
        toolbarItems={toolbarItems}
        showNav={!templateId}
        onShare={onShare}
        locked={locked}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default ScheduleView;
