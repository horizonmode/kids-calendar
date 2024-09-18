"use client";
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
import {
  GenericItem,
  ItemType,
  Person,
  ScheduleItem,
  ScheduleSection,
  Section,
} from "@/types/Items";
import { Delta } from "./Delta";
import { useTemplateContext } from "@/store/template";
import useOptimisticSchedules from "@/hooks/useOptimisticWeekSchedules";
import useModalContext from "@/store/modals";
import usePersonContext from "@/store/people";
import PersonSelect from "./PersonSelect";
import WeekCell from "./WeekCell";
import scheduleService from "@/utils/scheduleService";
import templateService from "@/utils/templateService";
import { updateTemplateAction } from "@/serverActions/templates";
const { addPersonIfNotExists, removePersonIfExists, toolbarItems } =
  scheduleService;
const { findItemInTemplate, reorderTemplate } = templateService;

interface TemplateViewProps {
  templateId: string;
  calendarId: string;
  onShare: () => void;
}

const TemplateView = ({
  calendarId,
  templateId,
  onShare,
}: TemplateViewProps) => {
  const [templates] = useTemplateContext((state) => [state.templates], shallow);

  const [people, showPeople, setShowPeople] = usePersonContext(
    (state) => [state.people, state.showPeople, state.setShowPeople],
    shallow
  );

  const [setShowModal] = useModalContext(
    (state) => [state.setShowModal],
    shallow
  );

  const template = templates.find((t) => t.id === templateId) || {
    id: templateId,
    name: "new template",
    schedule: [],
    type: "template",
  };

  const assignPerson = async (destination: GenericItem, person: Person) => {
    addPersonIfNotExists(destination, person);
    await updateTemplateAction(calendarId, template, "/grids/");
  };

  const removePerson = async (source: GenericItem, person: Person) => {
    removePersonIfExists(source, person);
    await updateTemplateAction(calendarId, template, "/grids/");
  };

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
    const type = activeItem.data.current?.type as ItemType;

    switch (type) {
      case "people": {
        const { itemId: personId } = (activeItem.data.current as any).extra;
        const person = people.find((p) => p.id === parseInt(personId));
        if (!person) return;

        if (destination === "toolbar-person") {
          const { sourceId } = (activeItem.data.current as any).extra;
          const sourceItem = findItemInTemplate(sourceId, template);
          if (!sourceItem) throw new Error("Source not found");
          await removePerson(sourceItem, person);
        } else {
          const targetItem = findItemInTemplate(destination, template);
          if (!targetItem) throw new Error("No target found");
          await assignPerson(targetItem, person);
        }
        break;
      }

      default: {
        if (destination === "toolbar-person" || destination === "toolbar")
          return;
        const {
          template: reorderedTemplate,
          source,
          target,
        } = reorderTemplate(
          itemId.toString(),
          parseInt(day),
          sectionName,
          delta,
          template,
          toolbarItems
        );

        if (!reorderedTemplate || !target) throw new Error("Invalid");

        startTransition(() => {
          setSchedules({
            source,
            target,
            targetSection: sectionName,
            targetItemIndex: 0,
            action: "move",
          });
        });

        const newTemplate = source
          ? {
              ...template,
              schedule: [
                ...template.schedule.filter(
                  (s) => s.day !== target.day && s.day !== source.day
                ),
                source,
                target,
              ],
            }
          : {
              ...template,
              schedule: [
                ...template.schedule.filter((s) => s.day !== target.day),
                target,
              ],
            };

        await updateTemplateAction(calendarId, newTemplate, "/grids/");
      }
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
    useOptimisticSchedules(template.schedule);

  if (!template) return null;

  const peopleMenuActive = template?.schedule.some(
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
    const scheduleIndex = template.schedule.findIndex((s) => s.day === day);
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

    const newTemplate = {
      ...template,
      schedule: template.schedule.map((s) =>
        s.day === day ? scheduleItem : s
      ),
    };

    await updateTemplateAction(calendarId, newTemplate, "/grids/");
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
        toolbarItems={toolbarItems}
        showNav={false}
        onShare={onShare}
        locked={locked}
        onToggleLock={() => setLocked(!locked)}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default TemplateView;
