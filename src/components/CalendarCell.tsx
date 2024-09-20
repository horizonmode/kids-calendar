import {
  CalendarDay,
  EventItem,
  GenericItem,
  PostCardItem,
} from "@/types/Items";
import Droppable from "./Droppable";
import { Days } from "@/utils/days";
import { renderNote, renderPostCard } from "@/utils/renderItems";
import { useState } from "react";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";

interface CalendarCellProps {
  day: number;
  month: number;
  year: number;
  data?: CalendarDay;
  isDragging: boolean;
  selected: boolean;
  onSelectDay: (day: number) => void;
  disableDrag?: boolean;
  showPeople?: boolean;
  disablePeopleDrag?: boolean;
  locked?: boolean;
  onEditDay?: (
    day: CalendarDay,
    itemIndex: number,
    action: "move" | "update" | "delete"
  ) => void;
}

const days = new Days();

const CalendarCell: React.FC<CalendarCellProps> = ({
  day,
  month,
  year,
  data,
  isDragging,
  selected,
  onSelectDay,
  disableDrag = false,
  showPeople = false,
  locked = false,
  disablePeopleDrag = true,
  onEditDay,
}) => {
  const [editingItem, setEditingItem] = useState<
    GenericItem | EventItem | null
  >(null);

  const today = new Date();

  const onItemUpdateContent = (item: Partial<GenericItem>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, ...item });
    }
  };

  const onItemDelete = async (item: GenericItem) => {
    if (data) {
      const newData = {
        ...data,
        items: data.items.filter((i) => i.id !== item.id),
      };

      onEditDay && onEditDay(newData, data.items.indexOf(item), "delete");
      setEditingItem(null);
    }
  };

  const onItemSelect = (item: GenericItem) => {
    setEditingItem(item);
  };

  const onItemDeselect = async (item: GenericItem) => {
    if (data) {
      const newData = {
        ...data,
        items: data.items.map((item) =>
          editingItem && item.id === editingItem.id ? editingItem : item
        ),
      };

      onEditDay &&
        onEditDay(
          newData,
          data.items.findIndex((i) => i.id === item.id),
          "update"
        );
      setEditingItem(null);
    }
  };

  const [setActiveModals] = useModalContext((state) => [state.setActiveModals]);
  const [setImageContextItem] = useImageContext((state) => [
    state.setEditingItem,
  ]);

  const onAddImageClicked = (item: PostCardItem) => {
    setImageContextItem(item);
    setActiveModals("gallery", true);
  };

  const onImageClicked = (item: PostCardItem) => {
    setImageContextItem(item);
    setActiveModals("photo", true);
  };

  const renderItem = (item: GenericItem, key: string) => {
    switch (item.type) {
      case "note":
      case "post-it":
        return renderNote(
          !!editingItem && editingItem.id === item.id ? editingItem : item,
          !!editingItem && editingItem.id === item.id,
          onItemUpdateContent,
          onItemDelete,
          onItemSelect,
          onItemDeselect,
          showPeople,
          disablePeopleDrag,
          locked,
          key
        );
      case "post-card":
        return renderPostCard(
          !!editingItem && editingItem.id === item.id
            ? (editingItem as PostCardItem)
            : (item as PostCardItem),
          !!editingItem && editingItem.id === item.id,
          onItemUpdateContent,
          onItemDelete,
          onItemSelect,
          onItemDeselect,
          showPeople,
          disablePeopleDrag,
          locked,
          () => onAddImageClicked(item as PostCardItem),
          () => onImageClicked(item as PostCardItem),
          key
        );
    }
  };

  return (
    <Droppable
      day={day}
      id={day.toString()}
      dragging={isDragging}
      isPast={
        day < today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      }
      isToday={
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      }
      highlight={selected}
      onClick={() => onSelectDay(day)}
      label={days.getWeekDay(day)}
      disabled={disableDrag}
      loading={data?.status === "pending"}
    >
      {data && data.items.map((item, i) => renderItem(item, `${item.id}-${i}`))}
    </Droppable>
  );
};

export default CalendarCell;
