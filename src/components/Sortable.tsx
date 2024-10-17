import { useSortable } from "@dnd-kit/sortable";
import Note from "./Note";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import opacity from "hex-color-opacity";

export interface SortableItemProps {
  disabled?: boolean;
  id: UniqueIdentifier;
  onRemove?: () => void;
  element: string;
  children?: React.ReactNode;
  data: any;
}

export function Sortable({
  disabled,
  id,
  element,
  children,
  data,
}: // wrapperStyle,
SortableItemProps) {
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
    disabled,
    data: {
      type: element,
      action: "sort",
      extra: { itemId: id, ...data },
    },
    // getNewIndex,
  });

  const styles = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={styles} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
