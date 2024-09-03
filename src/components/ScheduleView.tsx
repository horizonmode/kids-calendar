import React, { CSSProperties, useEffect, useState } from "react";
import Droppable from "@/components/Droppable";
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
import Note from "./Note";
import { shallow } from "zustand/shallow";
import Toolbar from "./Toolbar";
import { useScheduleContext } from "@/store/schedule";
import PostCard from "./PostCard";
import { GenericItem, ScheduleItem, Section } from "@/types/Items";
import { Delta } from "./Delta";
import Draggable from "./Draggable";
import Editable from "./Editable";
import PersonSelect from "./PersonSelect";
import usePersonContext from "@/store/people";
import useModalContext from "@/store/modals";
import PersonAssignment from "./PersonAssignment";

interface ScheduleViewProps {
  year: number;
  week: number;
  templateId?: string;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  onShare: () => void;
  saving: boolean;
}

const ScheduleView = ({
  year,
  week,
  templateId,
  onNext,
  onPrev,
  onSave,
  onShare,
  saving,
}: ScheduleViewProps) => {
  const [
    schedules,
    toolbarItems,
    reorderSchedule,
    editItem,
    selectItem,
    deselectItem,
    deleteScheduleItem,
    pendingChanges,
    assignPerson,
    removePerson,
  ] = useScheduleContext(
    (state) => [
      state.schedules,
      state.toolbarItems,
      state.reorderSchedule,
      state.editItem,
      state.selectItem,
      state.deselectItem,
      state.deleteScheduleItem,
      state.pendingChanges,
      state.assignPerson,
      state.removePerson,
    ],
    shallow
  );

  const [people, pendingPeoplechanges, showPeople, setShowPeople] =
    usePersonContext(
      (state) => [
        state.people,
        state.pendingChanges,
        state.showPeople,
        state.setShowPeople,
      ],
      shallow
    );

  const [setShowModal] = useModalContext(
    (state) => [state.setShowModal],
    shallow
  );

  const onEdit = (
    id: string,
    item: GenericItem,
    year: number,
    week: number
  ) => {
    editItem(id, item, year, week);
  };

  const onItemSelect = (id: string, year: number, week: number) => {
    selectItem(id, year, week);
  };

  const onItemDrag = (over: Over, delta: Delta, activeItem: Active) => {
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
        assignPerson(destination, person);
      }
    } else {
      reorderSchedule(
        itemId.toString(),
        parseInt(day),
        sectionName,
        delta,
        year,
        week
      );
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

  const sections = ["Morning", "Afternoon", "Evening"];

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

  const getStyle: (d: GenericItem) => CSSProperties = (d) => ({
    position: "absolute",
    zIndex: `${d.order + 2 * 10}`,
    transform: d.x === 0 && d.y === 0 ? "translate(-50%,-50%)" : "none",
  });

  const deleteItem = (itemId: string, year: number, week: number) => {
    deleteScheduleItem(itemId, year, week);
  };

  const renderItems = (items: GenericItem[]) => {
    return items.map((d, i) => {
      switch (d.type) {
        case "post-it":
        case "text":
          return (
            <Draggable
              id={d.id}
              key={`drag-postit-${d}-${i}`}
              left={`${d.x || 50 + i * 5}%`}
              top={`${d.y || 50 + i * 5}%`}
              element="post-it"
              style={getStyle(d)}
              data={{ content: d.content }}
            >
              <Editable
                onDelete={() => deleteItem(d.id, year, week)}
                onSelect={(selected: boolean) => {
                  if (selected) {
                    onItemSelect(d.id, year, week);
                  } else deselectItem(d.id, year, week);
                }}
                color={d.color || "#0096FF"}
                onChangeColor={(color: string) => {
                  onEdit(d.id, { ...d, color }, year, week);
                }}
                editable={d.editable || false}
                position="right"
                className={`${locked ? "hidden" : ""}`}
              >
                <Note
                  content={d.content}
                  onUpdateContent={(content) =>
                    onEdit(d.id, { ...d, content }, year, week)
                  }
                  color={d.color}
                  editable={d.editable || false}
                />
              </Editable>
              {showPeople && (
                <PersonAssignment
                  id={d.id}
                  people={d.people || []}
                  disabled={
                    !isDragging || dragType == null || dragType !== "person"
                  }
                  style={{ marginTop: "-5px" }}
                  onRemove={(person) => {
                    assignPerson(d.id, person);
                  }}
                />
              )}
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
                onDelete={() => deleteItem(d.id, year, week)}
                onSelect={(selected: boolean) => {
                  if (selected) {
                    onItemSelect(d.id, year, week);
                  } else deselectItem(d.id, year, week);
                }}
                color={d.color || "#0096FF"}
                onChangeColor={(color: string) => {
                  onEdit(d.id, { ...d, color }, year, week);
                }}
                editable={d.editable || false}
                position="right"
                className={`${locked ? "hidden" : ""}`}
              >
                <PostCard
                  key={`drag-postcard-${i}`}
                  content={d.content || ""}
                  editable={d.editable || false}
                  onUpdateContent={(content) =>
                    onEdit(d.id, { ...d, content }, year, week)
                  }
                  fileUrl={d.file}
                  color={d.color}
                ></PostCard>
              </Editable>
              {showPeople && (
                <PersonAssignment
                  id={d.id}
                  people={d.people || []}
                  disabled={
                    !isDragging || dragType == null || dragType !== "person"
                  }
                  style={{ marginTop: "-5px" }}
                  onRemove={(person) => {
                    assignPerson(d.id, person);
                  }}
                />
              )}
            </Draggable>
          );
      }
    });
  };

  const updateDragState = (e: DragMoveEvent) => {
    const { activatorEvent, delta, over, collisions } = e;
    if (!over) return;
    const el = activatorEvent.target as HTMLElement;
    var rect = el.getBoundingClientRect();
    const x = (rect.x + delta.x - over.rect.left) / over.rect.width;
    const y = (rect.y + delta.y - over.rect.top) / over.rect.height;
    setDragType(e?.active?.data?.current?.type);
  };

  const existingSchedule = schedules.find(
    (s) => s.year === year && s.week === week
  );

  const peopleMenuActive = existingSchedule?.schedule.some(
    (s) =>
      s.morning?.length > 0 || s.afternoon.length > 0 || s.evening.length > 0
  );

  useEffect(() => {
    if (locked) {
      existingSchedule?.schedule.forEach((s) => {
        s.morning?.forEach((m) => deselectItem(m.id, year, week));
        s.afternoon?.forEach((m) => deselectItem(m.id, year, week));
        s.evening?.forEach((m) => deselectItem(m.id, year, week));
      });
    }
  }, [locked]);

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
          const dayItems = existingSchedule?.schedule.find(
            (s) => s.day === dayIndex + 1
          );
          return (
            <div
              className="flex flex-col items-stretch justify-stretch mb-5 md:mb-0"
              key={`day-${dayIndex}}`}
            >
              <h2 className="text-center mb-3">{labels[dayIndex]}</h2>
              {!templateId && (
                <h3 className="text-center mb-3">{days[dayIndex]}</h3>
              )}
              {[...Array(3)].map((_, sectionIndex) => {
                const section = sections[sectionIndex].toLowerCase();
                const sectionKey = section as keyof ScheduleItem;

                return (
                  <div key={`section-${dayIndex}-${sectionIndex}`}>
                    <Droppable
                      id={`${dayIndex}-${sectionIndex}`}
                      dragging={isDragging}
                      isPast={false}
                      isToday={false}
                      onClick={() => {}}
                    >
                      {dayItems &&
                        dayItems[sectionKey] &&
                        renderItems(dayItems[sectionKey] as GenericItem[])}
                      <div
                        className={
                          "absolute left-0 w-10 h-full bg-slate-400 flex flex-row justify-center items-center"
                        }
                        style={{
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)",
                        }}
                      >
                        <span>{sections[sectionIndex]}</span>
                      </div>
                    </Droppable>
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
        onSave={onSave}
        onToggleLock={() => setLocked(!locked)}
        toolbarItems={toolbarItems}
        showNav={!templateId}
        saving={saving}
        onShare={onShare}
        locked={locked}
        pendingChanges={pendingChanges > 0 || pendingPeoplechanges > 0}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default ScheduleView;
