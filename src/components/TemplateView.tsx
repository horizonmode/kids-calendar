"use client";
import React, { CSSProperties, useState } from "react";
import Droppable from "@/components/Droppable";
import DraggableOverlay from "@/components/DraggableOverlay";
import {
  rectIntersection,
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  Over,
  Active,
  DragMoveEvent,
} from "@dnd-kit/core";
import Note from "./Note";
import { shallow } from "zustand/shallow";
import Toolbar from "./Toolbar";
import Text from "./Text";
import { useScheduleStore } from "@/store/schedule";
import PostCard from "./PostCard";
import { GenericItem, ScheduleItem, Section } from "@/types/Items";
import { Delta } from "./Delta";
import Draggable from "./Draggable";
import { useTemplateStore } from "@/store/template";

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
    deleteTemplateItem,
  ] = useTemplateStore(
    (state) => [
      state.templates,
      state.toolbarItems,
      state.reorderTemplate,
      state.editTemplateItem,
      state.selectTemplateItem,
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

  const activationConstraint = {
    delay: 100,
    tolerance: 5,
    distance: 3,
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

  const renderItems = (items: GenericItem[]) => {
    return items.map((d, i) => {
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
              data={{ content: d.content }}
            >
              <Note
                content={d.content}
                onUpdateContent={(content) => onEdit(d.id, { ...d, content })}
                color={d.color}
                editable={false}
              />
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
                onUpdateContent={(content) => onEdit(d.id, { ...d, content })}
                onDelete={() => deleteItem(d.id)}
                onSelect={() => onItemSelect(d.id)}
                color={d.color}
                onChangeColor={(color) => {
                  onEdit(d.id, { ...d, color });
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
            >
              <PostCard
                key={`drag-postcard-${i}`}
                id={d.id}
                content={d.content}
                style={getStyle(d)}
                onUpdateContent={(content) => onEdit(d.id, { ...d, content })}
                onFileChange={(file) => onEdit(d.id, { ...d, file })}
                fileUrl={d.file}
              ></PostCard>
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
      <div className="w-full h-full relative flex flex-col md:grid md:grid-cols-7">
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
      <Toolbar
        onSave={onSave}
        toolbarItems={toolbarItems}
        showNav={!templateId}
        saving={saving}
        onShare={onShare}
      />
      <DraggableOverlay />
    </DndContext>
  );
};

export default TemplateView;
