import {
  CalendarDay,
  EventItem,
  GenericItem,
  GroupItem,
  PostCardItem,
} from "@/types/Items";
import Droppable from "./Droppable";
import { Days } from "@/utils/days";
import { renderGroup, renderNote, renderPostCard } from "@/utils/renderItems";
import { useState } from "react";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";
import { useCalendarContext } from "@/store/calendar";
import { shallow } from "zustand/shallow";
import { useDndContext } from "@dnd-kit/core";
import useGroupContext from "@/store/groups";

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
  disableGroupSort: boolean;
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
  disableGroupSort,
  onEditDay,
}) => {
  const [selectedGroup, setSelectedGroup] = useCalendarContext(
    (state) => [state.selectedGroup, state.setSelectedGroup],
    shallow
  );

  const [groupId, item, action] = useGroupContext(
    (state) => [state.groupId, state.item, state.action],
    shallow
  );

  const { over } = useDndContext();

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

  const renderItem = (
    item: GenericItem,
    key: string,
    style?: React.CSSProperties,
    sortable: boolean = false
  ) => {
    const isOver = over ? over.id.toString() === item.id : false;
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
          key,
          style,
          sortable
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
          key,
          style,
          sortable
        );
      case "group":
        return renderGroup(
          !!editingItem && editingItem.id === item.id
            ? (editingItem as GroupItem)
            : (item as GroupItem),
          !!editingItem && editingItem.id === item.id,
          onItemUpdateContent,
          onItemDelete,
          onItemSelect,
          onItemDeselect,
          () => setSelectedGroup(item.id as string),
          () => setSelectedGroup(null),
          selectedGroup === item.id,
          showPeople,
          disablePeopleDrag,
          locked,
          key,
          disableGroupSort,
          isOver
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
      label={days.getWeekDay(new Date(year, month, day))}
      disabled={disableDrag || selectedGroup !== null}
      loading={data?.status === "pending"}
    >
      {data && data.items.map((item, i) => renderItem(item, `${item.id}-${i}`))}
    </Droppable>
  );
};

export default CalendarCell;
