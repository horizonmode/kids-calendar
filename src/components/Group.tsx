import { EventItem, GenericItem, GroupItem, PostCardItem } from "@/types/Items";
import { renderNote, renderPostCard } from "@/utils/renderItems";
import { useState } from "react";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";
import { useDroppable } from "@dnd-kit/core";
import SortableGrid from "./Bucket";

interface GroupProps {
  onClick?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  id: string;
  style?: React.CSSProperties;
  data?: GroupItem;
  selected: boolean;
  disableDrag?: boolean;
  disableDrop: boolean;
  onEditGroup?: (
    group: GroupItem,
    index: number,
    action: "delete" | "update"
  ) => void;
}

const Group: React.FC<GroupProps> = ({
  id,
  data,
  selected,
  disableDrag = false,
  disableDrop,
  onEditGroup,
  style,
  onClick,
  onClose,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: selected ? "group-selected" : `group-${id}`,
    disabled: disableDrop,
    data: { type: "group", itemId: id },
  });

  const [editingItem, setEditingItem] = useState<
    GenericItem | EventItem | null
  >(null);

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

      onEditGroup && onEditGroup(newData, data.items.indexOf(item), "delete");
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

      onEditGroup &&
        onEditGroup(
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
    style?: React.CSSProperties
  ) => {
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
          false,
          true,
          true,
          key,
          style,
          true
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
          false,
          true,
          true,
          () => onAddImageClicked(item as PostCardItem),
          () => onImageClicked(item as PostCardItem),
          key,
          style,
          true
        );
    }
  };

  return (
    <div
      style={style}
      ref={setNodeRef}
      onClick={() => !selected && onClick && onClick()}
      className={`rounded-md bg-white z-20 shadow-xl pointer-events-auto overflow-auto p-2
      ${selected ? "w-96 h-96" : "w-96 h-96"} ${
        !disableDrop && isOver && "border-2 border-dashed border-gray-500"
      } ${disableDrop && isOver && " border-2 border-solid border-red-500"}`}
    >
      <SortableGrid
        renderItem={renderItem}
        items={data?.items}
        disableAll={false}
      />
    </div>
  );
};

export default Group;
