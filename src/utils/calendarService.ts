import { Delta } from "@/components/Delta";
import {
  CalendarDay,
  EventItem,
  GenericItem,
  GroupItem,
  Person,
  ToolbarItem,
} from "@/types/Items";
import { Days } from "@/utils/days";
import { reOrderAll, reOrderLayers } from "@/utils/layers";
import { v4 as uuidv4 } from "uuid";

export interface CalendarService {
  toolbarItems: GenericItem[];
  findItem: (
    items: GenericItem[],
    itemId: string
  ) => { item: GenericItem; index: number };
  adjustDateByMonth: (month: number, selectedDay: Date) => Date;
  getCurrentDay: (selectedDay: Date) => {
    day: number;
    month: number;
    year: number;
  };
  getYear: (selectedDay: Date) => number;
  getMonth: (selectedDay: Date) => number;
  getDaysInMonth: (selectedDay: Date) => number;
  getDaysContent: (days: CalendarDay[], selectedDay: Date) => CalendarDay[];
  getDaysEvents: (events: EventItem[], selectedDay: Date) => EventItem[];
  reorderDays: (
    itemId: string,
    overId: number,
    delta: Delta,
    month: number,
    year: number,
    days: CalendarDay[],
    toolbarItems: (GenericItem | EventItem)[]
  ) => {
    days: CalendarDay[];
    sourceDay: CalendarDay | null;
    targetDay: CalendarDay;
    targetItemIndex: number;
  };
  reorderEvents: (
    events: EventItem[],
    itemId: string,
    overId: number,
    month: number,
    year: number,
    isStart: boolean,
    isEnd: boolean,
    delta: Delta,
    action: string,
    toolbarItems: GenericItem[],
    selectedDay: Date
  ) => { events: EventItem[]; event: EventItem };
  reorderGroups: (
    itemId: string,
    groupId: string,
    delta: Delta,
    days: CalendarDay[],
    toolbarItems: (GenericItem | EventItem)[]
  ) => {
    days: CalendarDay[];
    sourceDay: CalendarDay | null;
    targetDay: CalendarDay;
    targetItemIndex: number;
  };
  addPersonIfNotExists: (item: GenericItem, person: Person) => void;
  removePersonIfExists: (item: GenericItem, person: Person) => void;
  findItemType: (
    itemId: string,
    days: CalendarDay[],
    events: EventItem[]
  ) => {
    type: string;
    itemIndex?: number;
    dayIndex?: number;
    eventIndex?: number;
    toolbarIndex?: number;
  };
}

const toolbarItems: ToolbarItem[] = [
  {
    id: "toolbar-post-it",
    type: "post-it",
    content: "new post-it",
    x: 0,
    y: 0,
    order: 0,
    color: "#0096FF",
    people: [],
  },
  {
    id: "toolbar-event",
    type: "event",
    content: "new event",
    x: 0,
    y: 0,
    order: 0,
    color: "#0000FF",
    people: [],
  },
  {
    id: "toolbar-postcard",
    type: "post-card",
    content: "new post-card",
    x: 0,
    y: 0,
    order: 0,
    color: "#FF00FF",
    people: [],
  },
  {
    id: "toolbar-group",
    type: "group",
    content: "new group",
    x: 0,
    y: 0,
    order: 0,
    color: "#FF00FF",
    people: [],
    items: [],
  },
];

const findItem = (items: GenericItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id == itemId);
  return { item: items[itemIndex], index: itemIndex };
};

const findItemType = (
  itemId: string,
  days: CalendarDay[],
  events: EventItem[]
) => {
  const dayIndex = days.findIndex(
    (d) => d.items.findIndex((i) => i.id == itemId) > -1
  );
  if (dayIndex > -1) {
    const itemIndex = days[dayIndex].items.findIndex((i) => i.id == itemId);
    return { type: "day", dayIndex, itemIndex };
  }
  const eventIndex = events.findIndex((d) => d.id === itemId);
  if (eventIndex > -1) {
    return { type: "event", eventIndex };
  }
  return {
    type: "toolbar",
    toolbarIndex: toolbarItems.findIndex((d) => d.id === itemId),
  };
};

const adjustDateByMonth = (month: number, selectedDay: Date) => {
  const days = new Days();
  const day = selectedDay.getDate();
  const year = selectedDay.getFullYear();
  const numOfDays = days.getDays(year, month);
  if (numOfDays < day) {
    selectedDay.setDate(day - (day - numOfDays));
  }
  selectedDay.setMonth(month);
  return new Date(selectedDay);
};

const getCurrentDay = (selectedDay: Date) => ({
  day: selectedDay.getDate(),
  month: selectedDay.getMonth(),
  year: selectedDay.getFullYear(),
});

const getYear = (selectedDay: Date) => selectedDay.getFullYear();
const getMonth = (selectedDay: Date) => selectedDay.getMonth();
const getDaysInMonth = (selectedDay: Date) =>
  new Days().getDays(selectedDay.getFullYear(), selectedDay.getMonth());

const getDaysContent = (days: CalendarDay[], selectedDay: Date) => {
  return days.filter(
    (d) =>
      d.month === selectedDay.getMonth() + 1 &&
      d.year === selectedDay.getFullYear()
  );
};

const getDaysEvents = (events: EventItem[], selectedDay: Date) => {
  return events.filter(
    (d) =>
      d.month === selectedDay.getMonth() + 1 &&
      d.year === selectedDay.getFullYear()
  );
};

const addPersonIfNotExists = (item: GenericItem, person: Person) => {
  if (item.people === undefined) item.people = [];
  if (item.people.findIndex((p) => p === person.id) === -1)
    item.people.push(person.id);
};

const removePersonIfExists = (item: GenericItem, person: Person) => {
  if (item.people === undefined) return;
  const personIndex = item.people.findIndex((p) => p === person.id);
  if (personIndex > -1) item.people.splice(personIndex, 1);
};

const reorderDays = (
  itemId: string,
  overId: number,
  delta: Delta,
  month: number,
  year: number,
  days: CalendarDay[],
  toolbarItems: (GenericItem | EventItem)[]
) => {
  let targetDay: CalendarDay;
  let sourceDay: CalendarDay | null = null;
  let sourceItem: GenericItem | EventItem | null = null;
  let sourceItemIndex: number | null = null;

  // find source item
  const sourceDayIndex = days.findIndex(
    (d) => d.items.findIndex((i) => i.id == itemId) > -1
  );
  if (sourceDayIndex === -1) {
    // try to find in toolbars
    const toolbarIndex = toolbarItems.findIndex((d) => d.id === itemId);
    if (toolbarIndex > -1) {
      //
      sourceItem = { ...toolbarItems[toolbarIndex] };
      sourceItem.id = uuidv4();
    }
  } else {
    sourceDay = days[sourceDayIndex];
    const { item, index } = findItem(sourceDay.items, itemId);
    sourceItem = item;
    sourceItemIndex = index;
  }

  // find target day
  const targetDayIndex = days.findIndex(
    (d) => d.day === overId && d.month === month + 1 && d.year === year
  );
  if (targetDayIndex > -1) {
    targetDay = days[targetDayIndex];
  } else {
    targetDay = {
      day: overId,
      month: month + 1,
      year: year,
      items: [],
      type: "day",
    };
    days.push(targetDay);
  }

  let sourceGroup: GroupItem | null = null;
  // look in groups
  days.forEach((d) => {
    const groupIndex = d.items.findIndex(
      (i) =>
        i.type === "group" &&
        (i as GroupItem).items.findIndex((i) => i.id === itemId) > -1
    );
    if (groupIndex > -1) {
      sourceDay = d;
      const group = d.items[groupIndex] as GroupItem;
      const { item, index } = findItem(group.items, itemId);
      sourceItem = item;
      sourceItemIndex = index;
      sourceGroup = group;
    }
  });

  if (!sourceItem) throw new Error("Item not found");

  // modify item
  sourceItem.x = delta.x * 100;
  sourceItem.y = delta.y * 100;

  if (sourceDay && sourceItemIndex !== null) {
    // item has moved from one day to another
    // remove from source
    if (!sourceGroup) {
      console.log("splicing");
      sourceDay.items.splice(sourceItemIndex, 1);
      reOrderAll(sourceDay.items);
    } else {
      const group = sourceGroup as GroupItem;
      console.log("splicing group");
      const { index } = findItem(group.items, itemId);
      group.items.splice(index, 1);
      reOrderAll(group.items);
    }
  }

  targetDay.items.push(sourceItem);
  reOrderAll(targetDay.items);

  return {
    days,
    sourceDay,
    targetDay,
    targetItemIndex: targetDay?.items.findIndex((i) => i.id === itemId) || 0,
  };
};

const reorderEvents = (
  events: EventItem[],
  itemId: string,
  overId: number,
  month: number,
  year: number,
  isStart: boolean,
  isEnd: boolean,
  delta: Delta,
  action: string,
  toolbarItems: GenericItem[],
  selectedDay: Date
) => {
  let event = events.find((e) => e.id === itemId);
  if (!event) {
    // look in toolbar
    const itemIndex = toolbarItems.findIndex(
      (e) => e.id === itemId && e.type === "event"
    );
    if (itemIndex === -1) {
      throw new Error("Event not found");
    }
    event = { ...toolbarItems[itemIndex] } as EventItem;
    event.id = uuidv4();
    event.day = overId;
    event.days = 1;
    event.year = year;
    event.month = month + 1;
    event.y = delta.y * 100;
    events.push(event);

    reOrderLayers(events, event);
    return { events, event };
  }

  if (action === "move") {
    // move the event start day to selected day
    event.day = overId;

    // if the event goes past end of the month, trim the days.
    const overlap = event.day + event.days - getDaysInMonth(selectedDay);
    if (overlap > 0) {
      event.days = event.days - overlap;
    }

    event.y = delta.y * 100;
    reOrderLayers(events, event);
    return { events, event };
  }

  if (isStart && !isEnd && overId > event.day + event.days) {
    return { events, event };
  }
  if (isEnd && !isStart && overId < event.day) {
    return { events, event };
  }

  if (isStart && isEnd) {
    if (overId > event.day) {
      event.days = overId - event.day + 1;
    } else {
      event.day = overId;
      event.days = event.days + (event.day - overId);
    }
  }

  if (isEnd && !isStart) {
    event.days = overId - event.day + 1;
  }
  if (isStart && !isEnd) {
    if (overId < event.day) {
      // we've moved back
      event.days = event.days + (event.day - overId);
    }
    if (overId > event.day) {
      // we've moved forward

      event.days = event.days - (overId - event.day);
    }
    event.day = overId;
  }
  reOrderLayers(events, event);
  return {
    events,
    event,
  };
};

const reorderGroups = (
  itemId: string,
  groupId: string,
  delta: Delta,
  days: CalendarDay[],
  toolbarItems: (GenericItem | EventItem)[]
) => {
  let targetDay: CalendarDay | null = null;
  let targetGroup: GroupItem | null = null;
  let sourceDay: CalendarDay | null = null;
  let sourceGroup: GroupItem | null = null;
  let sourceItem: GenericItem | EventItem | null = null;
  let sourceItemIndex: number | null = null;

  // find source and destination group
  days.forEach((d) => {
    const targetGroupIndex = d.items.findIndex((i) => i.id === groupId);
    if (targetGroupIndex > -1) {
      targetDay = d;
      targetGroup = d.items[targetGroupIndex] as GroupItem;
    }

    const sourceGroupIndex = d.items.findIndex(
      (i) =>
        i.type === "group" &&
        (i as GroupItem).items.findIndex((i) => i.id === itemId) > -1
    );
    if (sourceGroupIndex > -1) {
      sourceDay = d;
      sourceGroup = d.items[sourceGroupIndex] as GroupItem;
      const { item, index } = findItem(sourceGroup.items, itemId);
      sourceItem = item;
      sourceItemIndex = index;
    }
  });

  if (!sourceDay) {
    // try to find in non group items
    const sourceDayIndex = days.findIndex(
      (d) => d.items.findIndex((i) => i.id == itemId) > -1
    );
    if (sourceDayIndex > -1) {
      sourceDay = days[sourceDayIndex];
      const { item, index } = findItem(sourceDay.items, itemId);
      sourceItem = item;
      sourceItemIndex = index;
    }
  }

  if (!sourceDay) {
    // try to find in toolbar
    const toolbarIndex = toolbarItems.findIndex((d) => d.id === itemId);
    if (toolbarIndex > -1) {
      sourceItem = { ...toolbarItems[toolbarIndex] };
      sourceItem.id = uuidv4();
    }
  }

  if (!sourceItem || !targetDay || !targetGroup)
    throw new Error("Error in reorderGroups");

  // modify item
  sourceItem.x = delta.x * 100;
  sourceItem.y = delta.y * 100;

  // remove from source
  if (sourceGroup && sourceItemIndex !== null) {
    const group = sourceGroup as GroupItem;
    group.items.splice(sourceItemIndex, 1);
    reOrderAll(group.items);
  } else if (sourceDay && sourceItemIndex !== null) {
    // item has moved from one day to another
    // remove from source
    sourceDay.items.splice(sourceItemIndex, 1);
    reOrderAll(sourceDay.items);
  }

  // add to target
  if (targetGroup === null || targetDay === null)
    throw new Error("Target not found");
  (targetGroup as GroupItem).items.push(sourceItem);

  const day = targetDay as CalendarDay;
  return {
    days,
    sourceDay,
    targetDay,
    targetItemIndex: day?.items.findIndex((i) => i.id === itemId) ?? 0,
  };
};

const service: CalendarService = {
  toolbarItems,
  findItem,
  adjustDateByMonth,
  getCurrentDay,
  getYear,
  getMonth,
  getDaysInMonth,
  getDaysContent,
  getDaysEvents,
  reorderDays,
  reorderEvents,
  addPersonIfNotExists,
  removePersonIfExists,
  findItemType,
  reorderGroups,
};

export default service;
