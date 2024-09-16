import { EventItem, GenericItem } from "@/types/Items";

export const reOrderLayers = (
  items: GenericItem[] | EventItem[],
  item: GenericItem | EventItem
) => {
  if (items.length < 2) return items;
  const numItems = items.length;
  if (item.order === numItems - 1) return items;
  item.order = numItems - 1;
  const otherItems = items.filter((i) => i.id !== item.id);
  otherItems.sort((a, b) => (a.order > b.order ? 1 : -1));
  for (var i = 0; i < otherItems.length; i++) {
    otherItems[i].order = i;
  }

  return items;
};

export const reOrderAll = (items: GenericItem[] | EventItem[]) => {
  if (items.length < 2) return items;
  items.sort((a, b) => (a.order > b.order ? 1 : -1));
  for (var i = 0; i < items.length; i++) {
    items[i].order = i;
  }
};
