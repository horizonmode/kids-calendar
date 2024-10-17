import { EventItem, GenericItem, GroupItem, PostCardItem } from "@/types/Items";
import { renderNote, renderPostCard } from "@/utils/renderItems";
import { useCallback, useMemo, useState } from "react";
import useModalContext from "@/store/modals";
import useImageContext from "@/store/images";
import SortableGrid from "./SortableList";
import Divider from "./Divider";
import useGroupContext from "@/store/groups";
import { shallow } from "zustand/shallow";
import { useSortable } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

interface GroupProps {
  onClick?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  id: string;
  style?: React.CSSProperties;
  data?: GroupItem;
  selected: boolean;
  disableDrag?: boolean;
  disableSort?: boolean;
  onEditGroup?: (
    group: GroupItem,
    index: number,
    action: "delete" | "update"
  ) => void;
  isOver?: boolean;
}

const Group: React.FC<GroupProps> = ({
  id,
  data,
  selected,
  disableDrag = false,
  disableSort = false,
  onEditGroup,
  style,
  onClick,
  onClose,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${id}-droppable`,
    disabled: false,
    data: { type: "group", groupId: id },
  });

  const [groupId, groupItem, action] = useGroupContext(
    (state) => [state.groupId, state.item, state.action],
    shallow
  );

  const [editingItem, setEditingItem] = useState<
    GenericItem | EventItem | null
  >(null);

  const onItemUpdateContent = useCallback(
    (item: Partial<GenericItem>) => {
      if (editingItem) {
        setEditingItem({ ...editingItem, ...item });
      }
    },
    [editingItem]
  );

  const onItemDelete = useCallback(
    async (item: GenericItem) => {
      if (data) {
        const newData = {
          ...data,
          items: data.items.filter((i) => i.id !== item.id),
        };

        onEditGroup && onEditGroup(newData, data.items.indexOf(item), "delete");
        setEditingItem(null);
      }
    },
    [data, onEditGroup]
  );

  const onItemSelect = useCallback((item: GenericItem) => {
    setEditingItem(item);
  }, []);

  const onItemDeselect = useCallback(async (item: GenericItem) => {
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
  }, []);

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
      case "divider":
        return <Divider key={key} />;
    }
  };

  let items = [...(data?.items || [])];
  if (groupId === id && groupItem) {
    if (action === "add" && !items.find((i) => i.id === groupItem.id)) {
      items.push(groupItem);
    } else if (
      action === "remove" &&
      items.find((i) => i.id === groupItem.id)
    ) {
      items = items.filter((i) => i.id !== groupItem.id);
    }
  }

  return (
    <div
      style={style}
      ref={setNodeRef}
      onClick={() => !selected && onClick && onClick()}
      className={`rounded-md  z-20 shadow-xl pointer-events-auto overflow-auto p-2 w-60 h-60 ${
        isOver ? " bg-red-500 outline-2 outline-red-500" : "bg-slate-400"
      }`}
    >
      <SortableGrid
        renderItem={renderItem}
        items={items}
        disableSort={disableSort}
      />
    </div>
  );
};

export default Group;
