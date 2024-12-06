import { Delta } from "@/components/Delta";
import {
  CalendarDay,
  CalendarItem,
  EventItem,
  GenericItem,
  Person,
} from "@/types/Items";
import { Days } from "@/utils/days";
import { reOrderAll, reOrderLayers } from "@/utils/layers";
import { v4 as uuidv4 } from "uuid";

export interface CalendarService {
  toolbarItems: (CalendarItem | EventItem)[];
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
    toolbarItems: CalendarItem[]
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
    toolbarItems: EventItem[],
    selectedDay: Date
  ) => { events: EventItem[]; event: EventItem };
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

const toolbarItems: (CalendarItem | EventItem)[] = [
  {
    id: "toolbar-post-it",
    type: "post-it",
    content: "rich content",
    x: 0,
    y: 0,
    order: 0,
    color: "#0096FF",
    people: [],
    width: 150,
    height: 150,
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
    day: 1,
    days: 1,
    month: 1,
    year: 2021,
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
    image: {
      url: "",
      id: 0,
    },
    width: 100,
    height: 75,
    showLabel: true,
  },
];

const findItem = (items: GenericItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id == itemId);
  return { item: items[itemIndex], index: itemIndex };
};

const findCalendarItemItem = (items: CalendarItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id == itemId);
  return { item: items[itemIndex], index: itemIndex };
};

const findEventItem = (items: EventItem[], itemId: string) => {
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
  toolbarItems: CalendarItem[]
) => {
  let targetDay: CalendarDay;
  let sourceDay: CalendarDay | null = null;
  let sourceItem: CalendarItem | null = null;
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
    const { item, index } = findCalendarItemItem(sourceDay.items, itemId);
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

  if (!sourceItem) throw new Error("Item not found");

  // modify item
  sourceItem.x = delta.x * 100;
  sourceItem.y = delta.y * 100;

  if (sourceDay && sourceItemIndex !== null) {
    // item has moved from one day to another
    // remove from source
    sourceDay.items.splice(sourceItemIndex, 1);
    reOrderAll(sourceDay.items);
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
};

export default service;
