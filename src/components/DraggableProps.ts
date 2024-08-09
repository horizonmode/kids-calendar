import {
  DraggableAttributes,
  DraggableSyntheticListeners,
} from "@dnd-kit/core";

export interface DraggableProps {
  listeners?: DraggableSyntheticListeners;
  attributes?: DraggableAttributes;
}

export interface DraggableItemProps {
  id: string;
}
