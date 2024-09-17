"use client";
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
import PostCard from "./PostCard";
import {
  GenericItem,
  PostCardItem,
  ScheduleItem,
  ScheduleSection,
  Section,
} from "@/types/Items";
import { Delta } from "./Delta";
import Draggable from "./Draggable";
import { useTemplateContext } from "@/store/template";
import Editable from "./Editable";

interface TemplateViewProps {
  templateId: string;
  onSave: () => void;
  onShare: () => void;
  saving: boolean;
}

const TemplateView = ({
  templateId,
  onSave,
  onShare,
  saving,
}: TemplateViewProps) => {
  const [
    templates,
    toolbarItems,
    reorderTemplate,
    editTemplateItem,
    selectTemplateItem,
    deselectTemplateItem,
    deleteTemplateItem,
  ] = useTemplateContext(
    (state) => [
      state.templates,
      state.toolbarItems,
      state.reorderTemplate,
      state.editTemplateItem,
      state.selectTemplateItem,
      state.deselectTemplateItem,
      state.deleteTemplateItem,
    ],
    shallow
  );

  const onEdit = (id: string, item: GenericItem) => {
    editTemplateItem(templateId, id, item);
  };

  const onItemSelect = (id: string) => {
    selectTemplateItem(id, templateId);
  };

  const onItemDeslect = (id: string) => {
    deselectTemplateItem(id, templateId);
  };

  const onItemDrag = (over: Over, delta: Delta, activeItem: Active) => {
    const [day, section] = over.id.toString().split("-");
    const sectionId = parseInt(section);
    const sectionName: Section =
      sectionId === 0 ? "morning" : sectionId === 1 ? "afternoon" : "evening";

    if (!over) {
      return;
    }
    const itemId = activeItem.id;

    reorderTemplate(
      templateId,
      itemId.toString(),
      parseInt(day),
      sectionName,
      delta
    );
  };

  const [{ algorithm }, setCollisionDetectionAlgorithm] = useState({
    algorithm: rectIntersection,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [locked, setLocked] = useState<boolean>(false);

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

  const labels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const sections = ["Morning", "Afternoon", "Evening"];

  const getStyle: (d: GenericItem) => CSSProperties = (d) => ({
    position: "absolute",
    zIndex: `${d.order + 2 * 10}`,
    transform: d.x === 0 && d.y === 0 ? "translate(-50%,-50%)" : "none",
  });

  const deleteItem = (itemId: string) => {
    deleteTemplateItem(itemId, templateId);
  };

  useEffect(() => {
    if (locked) {
      existingSchedule?.schedule.forEach((s) => {
        s.morning?.items.forEach((m) => deleteTemplateItem(m.id, templateId));
        s.afternoon?.items.forEach((m) => deleteTemplateItem(m.id, templateId));
        s.evening?.items.forEach((m) => deleteTemplateItem(m.id, templateId));
      });
    }
  }, [locked]);

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
                onDelete={() => deleteItem(d.id)}
                onSelect={(selected: boolean) => {
                  if (selected) {
                    onItemSelect(d.id);
                  } else onItemDeslect(d.id);
                }}
                color={d.color || "#0096FF"}
                onChangeColor={(color: string) => {
                  onEdit(d.id, { ...d, color });
                }}
                editable={d.editable || false}
                position="right"
                className={`${locked ? "hidden" : ""}`}
              >
                <Note
                  content={d.content}
                  onUpdateContent={(content) => onEdit(d.id, { ...d, content })}
                  color={d.color}
                  editable={d.editable || false}
                />
              </Editable>
            </Draggable>
          );

        case "post-card":
          const postCardItem = d as PostCardItem;
          return (
            <Draggable
              id={d.id}
              key={`drag-postcard-${d.id}-${i}`}
              left={`${d.x || 50 + i * 5}%`}
              top={`${d.y || 50 + i * 5}%`}
              style={getStyle(d)}
              element="post-card"
              data={{ content: d.content, fileUrl: postCardItem.image?.url }}
              disabled={d.editable}
            >
              <Editable
                onDelete={() => deleteItem(d.id)}
                onSelect={(selected: boolean) => {
                  if (selected) {
                    onItemSelect(d.id);
                  } else onItemDeslect(d.id);
                }}
                color={d.color || "#0096FF"}
                onChangeColor={(color: string) => {
                  onEdit(d.id, { ...d, color });
                }}
                editable={d.editable || false}
                position="right"
              >
                <PostCard
                  key={`drag-postcard-${i}`}
                  content={d.content || ""}
                  editable={d.editable || false}
                  onUpdateContent={(content) => onEdit(d.id, { ...d, content })}
                  fileUrl={postCardItem.image?.url}
                  color={d.color}
                ></PostCard>
              </Editable>
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
  };

  const existingSchedule = templates.find((t) => t.id === templateId);

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
                        renderItems(
                          (dayItems[sectionKey] as ScheduleSection).items
                        )}
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
      <Toolbar
        toolbarItems={toolbarItems}
        showNav={!templateId}
        onShare={onShare}
        onToggleLock={() => setLocked(!locked)}
        locked={locked}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default TemplateView;
