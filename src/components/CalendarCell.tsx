import {
  CalendarDay,
  CalendarItem,
  EventItem,
  GenericItem,
  PostCardItem,
  PostItItem,
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
  expandedItems: string[];
  setExpandedItem: (item: string) => void;
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
  expandedItems = [],
  setExpandedItem,
}) => {
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);

  const today = new Date();

  const onItemDelete = async (item: CalendarItem) => {
    if (data) {
      const newData = {
        ...data,
        items: data.items.filter((i) => i.id !== item.id),
      };

      onEditDay && onEditDay(newData, data.items.indexOf(item), "delete");
      setEditingItem(null);
    }
  };

  const onItemSelect = (item: CalendarItem) => {
    setEditingItem(item);
  };

  const onItemDeselect = async (item: CalendarItem) => {
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

  const onUpdatePostCard = (item: Partial<PostCardItem>) => {
    if (editingItem && editingItem.type === "post-card") {
      setEditingItem({ ...editingItem, ...item });
    }
  };

  const onUpdatePostIt = (item: Partial<PostItItem>) => {
    if (editingItem && editingItem.type === "post-it") {
      setEditingItem({ ...editingItem, ...item });
    }
  };

  const renderItem = (item: CalendarItem, key: string) => {
    const itemWithType =
      !!editingItem &&
      editingItem.id === item.id &&
      item.type === editingItem.type
        ? editingItem
        : item;
    switch (itemWithType.type) {
      case "post-it":
        return renderNote(
          itemWithType,
          !!editingItem && editingItem.id === item.id,
          onUpdatePostIt,
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
          itemWithType,
          !!editingItem && editingItem.id === item.id,
          onUpdatePostCard,
          onItemDelete,
          onItemSelect,
          onItemDeselect,
          showPeople,
          disablePeopleDrag,
          locked,
          () => onAddImageClicked(itemWithType),
          () => onImageClicked(itemWithType),
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
      highlight={false}
      onClick={() => onSelectDay(day)}
      label={days.getWeekDay(new Date(year, month, day))}
      disabled={disableDrag}
      loading={data?.status === "pending"}
    >
      {data && data.items.map((item, i) => renderItem(item, `${item.id}-${i}`))}
    </Droppable>
  );
};

export default CalendarCell;
