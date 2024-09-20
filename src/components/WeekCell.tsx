import {
  GenericItem,
  PostCardItem,
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
    data: GenericItem,
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
  const [editingItem, setEditingItem] = useState<GenericItem | null>(null);

  const onItemUpdateContent = (item: Partial<GenericItem>) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, ...item });
    }
  };

  const onItemDelete = async (item: GenericItem) => {
    if (data) {
      onEditCell && onEditCell(item, data.items.indexOf(item), "delete");
    }

    setEditingItem(null);
  };

  const onItemSelect = (item: GenericItem) => {
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
