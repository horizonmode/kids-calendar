import Calendar from "@/app/grids/[calendarId]/calendar/page";
import { Delta } from "@/components/Delta";
import { CalendarDay, EventItem, GenericItem } from "@/types/Items";
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
    sourceDay: CalendarDay;
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
}

const toolbarItems: GenericItem[] = [
  {
    id: "toolbar-post-it",
    type: "post-it",
    content: "new post-it",
    x: 0,
    y: 0,
    order: 0,
    color: "#0096FF",
    editable: false,
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
    editable: false,
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
    editable: false,
    people: [],
  },
];

const findItem = (items: GenericItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id == itemId);
  return { item: items[itemIndex], index: itemIndex };
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
  const sourceDayIndex = days.findIndex(
    (d) => d.items.findIndex((i) => i.id == itemId) > -1
  );
  if (sourceDayIndex === -1) {
    // try to find in toolbars
    const toolbarIndex = toolbarItems.findIndex((d) => d.id === itemId);
    if (toolbarIndex > -1) {
      //
      const item = { ...toolbarItems[toolbarIndex] };
      item.id = uuidv4();
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
          dirty: true,
        };
        days.push(targetDay);
      }

      targetDay.softDelete = false;
      targetDay.dirty = true;

      item.x = delta.x * 100;
      item.y = delta.y * 100;
      targetDay.items.push(item);
      reOrderLayers(targetDay.items, item);

      return {
        days: [...days],
        sourceDay: { ...targetDay },
        targetDay: { ...targetDay },
        targetItemIndex: targetDay.items.findIndex((i) => i.id === itemId),
      };
    } else {
      throw new Error("Item not found");
    }
  } else {
    const day = { ...days[sourceDayIndex] };
    const sourceIndex = day.items.findIndex((i) => i.id == itemId);
    const item = day.items[sourceIndex];

    if (day.day !== overId) {
      day.items.splice(sourceIndex, 1);
      day.softDelete = day.items.length === 0;
      day.dirty = true;
      const targetDayIndex = days.findIndex(
        (d) => d.day === overId && d.month === month + 1 && d.year === year
      );
      if (targetDayIndex > -1) {
        targetDay = { ...days[targetDayIndex] };
      } else {
        targetDay = {
          day: overId,
          month: month + 1,
          year: year,
          items: [],
          type: "day",
          dirty: true,
        };
        days.push(targetDay);
      }

      targetDay.softDelete = false;
      targetDay.dirty = true;

      item.x = delta.x * 100;
      item.y = delta.y * 100;
      targetDay.items.push(item);
      reOrderLayers(targetDay.items, item);
      reOrderAll(day.items);
    } else {
      targetDay = day;
      item.x = delta.x * 100;
      item.y = delta.y * 100;
      day.dirty = true;
      reOrderLayers(day.items, item);
    }

    return {
      days: [...days],
      sourceDay: { ...day },
      targetDay: { ...targetDay },
      targetItemIndex: targetDay?.items.findIndex((i) => i.id === itemId) || 0,
    };
  }
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
};

export default service;
