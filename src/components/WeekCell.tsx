import {
  CalendarItem,
  GenericItem,
  PostCardItem,
  PostItItem,
  ScheduleSection,
  Section,
} from "@/types/Items";
import Droppable from "./Droppable";
import { renderNote, renderPostCard } from "@/utils/renderItems";
import { useCallback, useState } from "react";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";

interface WeekCellProps {
  data?: ScheduleSection;
  section: Section;
  sectionIndex: number;
  day: number;
  isDragging: boolean;
  disableDrag?: boolean;
  showPeople?: boolean;
  disablePeopleDrag?: boolean;
  locked?: boolean;
  onEditCell?: (
    data: CalendarItem,
    itemIndex: number,
    action: "move" | "update" | "delete"
  ) => void;
}

const WeekCell: React.FC<WeekCellProps> = ({
  data,
  isDragging,
  section,
  sectionIndex,
  day,
  disableDrag = false,
  showPeople = false,
  locked = false,
  disablePeopleDrag = true,
  onEditCell,
}) => {
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);

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

  const onItemDelete = async (item: CalendarItem) => {
    if (data) {
      onEditCell && onEditCell(item, data.items.indexOf(item), "delete");
    }

    setEditingItem(null);
  };

  const onItemSelect = (item: CalendarItem) => {
    setEditingItem(item);
  };

  const onItemDeselect = async () => {
    if (data && editingItem) {
      onEditCell &&
        onEditCell(
          editingItem,
          data.items.findIndex((di) => di.id === editingItem.id),
          "update"
        );
    }

    setEditingItem(null);
  };

  const [setActiveModals] = useModalContext((state) => [state.setActiveModals]);
  const [setImageContextItem] = useImageContext((state) => [
    state.setEditingItem,
  ]);

  const onAddImageClicked = useCallback((item: PostCardItem) => {
    setImageContextItem(item);
    setActiveModals("gallery", true);
  }, []);

  const onImageClicked = useCallback((item: PostCardItem) => {
    setImageContextItem(item);
    setActiveModals("photo", true);
  }, []);

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
      id={`${day}-${sectionIndex}`}
      dragging={isDragging}
      isPast={false}
      isToday={false}
      onClick={() => {}}
      loading={data?.status === "pending"}
      disabled={disableDrag}
    >
      {data &&
        data.items?.map((item, i) => renderItem(item, `${item.id}-${i}`))}
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
        <span>{section}</span>
      </div>
    </Droppable>
  );
};

export default WeekCell;
