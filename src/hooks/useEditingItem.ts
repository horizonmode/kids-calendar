import { useEffect, useState } from "react";
import { GenericItem } from "@/types/Items";
import { useCalendarContext } from "@/store/calendar";
import { shallow } from "zustand/shallow";

const useEditingItem = () => {
  const [content, setContent] = useState<string | null>(null);
  const [editDay, selectedItem] = useCalendarContext(
    (state) => [state.editDay, state.selectedItem],
    shallow
  );

  const onFinishedEditing = (dayId: string, item: GenericItem) => {
    if (content === null || item.content === content) return;
    item.content = content;
    editDay(dayId, item);
    setContent(null);
  };

  const onItemUpdated = (itemId: string, content: string) => {
    if (selectedItem === null) return;
    if (selectedItem.id === itemId) setContent(content);
  };

  useEffect(() => {}, [selectedItem]);

  return { onFinishedEditing, onItemUpdated };
};

export default useEditingItem;
