"use client";
import React, { EventHandler, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";

import {
  Active,
  Announcements,
  closestCenter,
  CollisionDetection,
  DragOverlay,
  DndContext,
  DropAnimation,
  KeyboardSensor,
  KeyboardCoordinateGetter,
  Modifiers,
  MeasuringConfiguration,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  UniqueIdentifier,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  useDndContext,
} from "@dnd-kit/core";
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  rectSortingStrategy,
  AnimateLayoutChanges,
  NewIndexGetter,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MouseSensor, TouchSensor } from "@/utils/handlers";
import Note from "./Note";
import { Sortable } from "./Sortable";
import DraggableOverlay from "./DraggableOverlay";
import { GenericItem, PostCardItem } from "@/types/Items";
import PostCard from "./PostCard";
import Divider from "./Divider";
import Item from "./Item";

const defaultInitializer = (index: number) => index;

export function createRange<T = number>(
  length: number,
  initializer: (index: number) => any = defaultInitializer
): T[] {
  return [...new Array(length)].map((_, index) => initializer(index));
}

export interface Props {
  activationConstraint?: PointerActivationConstraint;
  animateLayoutChanges?: AnimateLayoutChanges;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  Container?: any; // To-do: Fix me
  dropAnimation?: DropAnimation | null;
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  itemCount?: number;
  items?: GenericItem[];
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  removable?: boolean;
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  style?: React.CSSProperties;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    active: Pick<Active, "id"> | null;
    index: number;
    isDragging: boolean;
    id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
  disableSort: boolean;
  renderItem(
    item: GenericItem,
    key: string,
    style?: React.CSSProperties
  ): React.ReactNode;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export default function SortableList({
  activationConstraint,
  animateLayoutChanges,
  adjustScale = false,
  collisionDetection = closestCenter,
  coordinateGetter = sortableKeyboardCoordinates,
  dropAnimation = dropAnimationConfig,
  getItemStyles = () => ({}),
  getNewIndex,
  handle = false,
  itemCount = 16,
  items: initialItems,
  isDisabled = () => false,
  measuring,
  modifiers = [restrictToVerticalAxis, restrictToParentElement],
  removable,
  reorderItems = arrayMove,
  strategy = verticalListSortingStrategy,
  style,
  useDragOverlay = true,
  wrapperStyle = () => ({}),
  disableSort = false,
  renderItem,
}: Props) {
  const [items, setItems] = useState<GenericItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLElement>() as React.MutableRefObject<HTMLElement>;

  const dndContext = useDndContext();

  useEffect(() => {
    ref.current = document.body;
    setMounted(true);
  }, []);

  useEffect(() => {
    const initItems = initialItems ?? [];
    setItems(initItems);
  }, [initialItems]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    })
  );
  const isFirstAnnouncement = useRef(true);
  const getIndex = (id: UniqueIdentifier) =>
    items.findIndex((item) => item.id === id);
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const activeIndex = activeId ? getIndex(activeId) : -1;

  const announcements: Announcements = {
    onDragStart({ active: { id } }) {
      return `Picked up sortable item ${String(
        id
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        items.length
      }`;
    },
    onDragOver({ active, over }) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragEnd({ active, over }) {
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragCancel({ active: { id } }) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id
      )} of ${items.length}.`;
    },
  };

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  const addDivider = () => {
    setItems((items) => [
      ...items,
      {
        id: `divider-${items.length}`,
        type: "divider",
        x: 0,
        y: 0,
        content: "",
        color: "black",
        order: 0,
      },
    ]);
  };

  return (
    <div className="flex">
      <SortableContext disabled={disableSort} items={items} strategy={strategy}>
        <ul className=" flex-1 grid grid-cols-1 gap-1 justify-start">
          {items.map((value) => renderItem(value, `sortable-item-${value.id}`))}
          <Divider ghost={true} onClick={addDivider} />
        </ul>
      </SortableContext>
    </div>
  );
}

interface SortableItemProps {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean;
  getNewIndex?: NewIndexGetter;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  useDragOverlay?: boolean;
  onRemove?(id: UniqueIdentifier): void;
  wrapperStyle?: React.CSSProperties;
  content: string;
}

export function SortableItem({
  disabled,
  animateLayoutChanges,
  getNewIndex,
  handle,
  id,
  index,
  onRemove,
  useDragOverlay,
  wrapperStyle,
  content,
}: SortableItemProps) {
  const {
    active,
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
    disabled,
    getNewIndex,
  });

  return (
    <Item
      ref={setNodeRef}
      value={content}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={
        handle
          ? {
              ref: setActivatorNodeRef,
            }
          : undefined
      }
      index={index}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      listeners={listeners}
      data-index={index}
      data-id={id}
      dragOverlay={!useDragOverlay && isDragging}
      {...attributes}
      wrapperStyle={wrapperStyle}
    />
  );
}
