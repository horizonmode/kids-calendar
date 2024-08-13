import { create } from "zustand";
import { Days } from "@/utils/days";
import { persist } from "zustand/middleware";
import { EventItem, GenericItem } from "@/types/Items";
import { Delta } from "@/components/Delta";

export interface Schedule {
  day: number;
  month: number;
  year: number;
  type: "day" | "week";
  calendarId?: string;
  items: GenericItem[];
  softDelete?: boolean;
}

const initialDays: Schedule[] = [
  {
    day: 1,
    month: 2,
    year: 2024,
    type: "day",
    calendarId: "1710407976635",
    items: [
      {
        id: "post-it-1",
        type: "post-it",
        content: "example content1",
        x: 0,
        y: 0,
        order: 0,
      },
      {
        id: "post-it-2",
        type: "post-it",
        content: "example content2",
        x: 0,
        y: 0,
        order: 1,
      },
      {
        id: "text-1",
        type: "text",
        content: "my text item",
        x: 0,
        y: 0,
        order: 2,
      },
    ],
  },
  {
    day: 10,
    month: 2,
    year: 2024,
    type: "day",
    calendarId: "1710407976635",
    items: [
      {
        id: "post-it-3",
        type: "post-card",
        content: "example content1",
        x: 0,
        y: 0,
        order: 0,
        file: "",
      },
    ],
  },
];

const initialEvents: EventItem[] = [
  {
    id: "event-0",
    type: "event",
    calendarId: "1710407976635",
    day: 2,
    month: 2,
    year: 2024,
    days: 1,
    content: "School Term Starts",
    y: 0,
    order: 1,
    color: "#0000ff",
  },
  {
    id: "event-1",
    day: 2,
    type: "event",
    calendarId: "1710407976635",
    month: 1,
    year: 2024,
    days: 7,
    content: "School Term Starts",
    y: 0,
    order: 2,
    color: "#0000ff",
  },
];

const toolbarItems: GenericItem[] = [
  {
    id: "toolbar-0-post-it",
    type: "post-it",
    content: "new post-it",
    x: 0,
    y: 0,
    order: 0,
    color: "#0096FF",
  },
  {
    id: "toolbar-0-event",
    type: "event",
    content: "new event",
    x: 0,
    y: 0,
    order: 0,
    color: "#0000ff",
  },
  {
    id: "toolbar-0-text",
    type: "text",
    content: "new text",
    x: 0,
    y: 0,
    order: 0,
    color: "black",
  },
  {
    id: "toolbar-0-postcard",
    type: "post-card",
    content: "example content1",
    x: 0,
    y: 0,
    order: 0,
    file: "",
  },
];

const findItem = (items: GenericItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id === itemId);
  return { item: items[itemIndex], index: itemIndex };
};

const reOrderLayers = (
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

const reOrderAll = (items: GenericItem[] | EventItem[]) => {
  if (items.length < 2) return items;
  items.sort((a, b) => (a.order > b.order ? 1 : -1));
  for (var i = 0; i < items.length; i++) {
    items[i].order = i;
  }
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

const getCurrentDay = ({ selectedDay }: { selectedDay: Date }) => ({
  day: selectedDay.getDate(),
  month: selectedDay.getMonth(),
  year: selectedDay.getFullYear(),
});
const getYear = ({ selectedDay }: { selectedDay: Date }) =>
  selectedDay.getFullYear();
const getMonth = ({ selectedDay }: { selectedDay: Date }) =>
  selectedDay.getMonth();
const getDaysInMonth = ({ selectedDay }: { selectedDay: Date }) =>
  new Days().getDays(selectedDay.getFullYear(), selectedDay.getMonth());
const getDaysContent = ({
  days,
  selectedDay,
}: {
  days: Schedule[];
  selectedDay: Date;
}) => {
  return days.filter(
    (d) =>
      d.month === selectedDay.getMonth() + 1 &&
      d.year === selectedDay.getFullYear() &&
      !d.softDelete
  );
};

const getDaysEvents = ({
  events,
  selectedDay,
}: {
  events: EventItem[];
  selectedDay: Date;
}) => {
  return events.filter(
    (d) =>
      d.month === selectedDay.getMonth() + 1 &&
      d.year === selectedDay.getFullYear() &&
      !d.softDelete
  );
};

export interface CalendarState {
  days: Schedule[];
  events: EventItem[];
  toolbarItems: (GenericItem | EventItem)[];
  selectedDay: Date;
  pendingChanges: number;
  nextMonth: () => void;
  prevMonth: () => void;
  setSelectedDay: (selectedDay: Date) => void;
  setDays: (days: Schedule[]) => void;
  addDay: (day: Schedule) => void;
  addEvent: (event: EventItem) => void;
  editDay: (itemId: string, newItem: GenericItem) => void;
  deleteItem: (itemId: string) => void;
  selectItem: (itemId: string) => void;
  deselectItem: (itemId: string) => void;
  selectEvent: (itemId: string) => void;
  deselectEvent: (itemId: string) => void;
  editEvent: (eventId: string, event: EventItem) => void;
  deleteEvent: (itemId: string) => void;
  addDayContent: (
    selDay: number,
    selMonth: number,
    setYear: number,
    itemId: string
  ) => void;
  reorderDays: (
    itemId: string,
    overId: number,
    delta: Delta,
    day: number,
    month: number,
    year: number
  ) => void;
  reorderEvents: (
    itemId: string,
    overId: number,
    day: number,
    month: number,
    year: number,
    isStart: boolean,
    isEnd: boolean,
    delta: Delta,
    action: string
  ) => void;
  deleteDay: (
    updatedItem: Schedule | EventItem,
    id: string
  ) => Promise<Response>;
  syncItem: (
    updatedItem: Schedule | EventItem,
    id: string
  ) => Promise<Response>;
  fetch: (id: string) => Promise<void>;
  sync: (id: string) => void;
}

const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      days: initialDays,
      events: initialEvents,
      toolbarItems: toolbarItems,
      selectedDay: new Date(),
      pendingChanges: 0,
      nextMonth: () =>
        set((state: CalendarState) => ({
          selectedDay: adjustDateByMonth(
            state.selectedDay.getMonth() + 1,
            state.selectedDay
          ),
        })),
      prevMonth: () =>
        set((state: CalendarState) => ({
          selectedDay: adjustDateByMonth(
            state.selectedDay.getMonth() - 1,
            state.selectedDay
          ),
        })),
      setSelectedDay: (selectedDay: Date) => set(() => ({ selectedDay })),
      setDays: (days: Schedule[]) => set({ days }),
      addDay: (day: Schedule) =>
        set((state: CalendarState) => ({ days: [...state.days, day] })),
      addEvent: (event: EventItem) =>
        set((state: CalendarState) => ({ events: [...state.events, event] })),
      editDay: (itemId: string, newItem: GenericItem) =>
        set((state: CalendarState) => {
          const newDays = [...state.days];
          const sourceDayIndex = newDays.findIndex(
            (d) => d.items.findIndex((i) => i.id === itemId) > -1
          );
          const day = newDays[sourceDayIndex];
          const sourceIndex = day.items.findIndex((i) => i.id === itemId);
          day.items[sourceIndex] = newItem;
          return { days: newDays };
        }),
      deleteItem: (itemId: string) =>
        set((state: CalendarState) => {
          const newDays = [...state.days];
          const sourceDayIndex = newDays.findIndex(
            (d) => d.items.findIndex((i) => i.id === itemId) > -1
          );
          const day = newDays[sourceDayIndex];
          const sourceIndex = day.items.findIndex((i) => i.id === itemId);
          day.items = [
            ...day.items.slice(0, sourceIndex),
            ...day.items.slice(sourceIndex + 1),
          ];

          day.softDelete = day.items.length === 0;

          reOrderAll(day.items);
          return { days: newDays, pendingChanges: state.pendingChanges + 1 };
        }),
      selectItem: (itemId: string) =>
        set((state: CalendarState) => {
          const newDays = [...state.days];
          const sourceDayIndex = newDays.findIndex(
            (d) => d.items.findIndex((i) => i.id === itemId) > -1
          );
          const day = newDays[sourceDayIndex];
          const { item } = findItem(day.items, itemId);
          item.editable = true;
          reOrderLayers(day.items, item);
          return { days: newDays };
        }),
      deselectItem: (itemId: string) =>
        set((state: CalendarState) => {
          const newDays = [...state.days];
          const sourceDayIndex = newDays.findIndex(
            (d) => d.items.findIndex((i) => i.id === itemId) > -1
          );
          const day = newDays[sourceDayIndex];
          const { item } = findItem(day.items, itemId);
          item.editable = false;
          return { days: newDays };
        }),
      selectEvent: (itemId: string) =>
        set((state: CalendarState) => {
          const newEvents = [...state.events];
          const sourceEventIndex = newEvents.findIndex((d) => d.id === itemId);
          const event = newEvents[sourceEventIndex];
          event.editable = true;
          reOrderLayers(newEvents, event);
          console.log("selected event", event);
          return { events: newEvents };
        }),
      deselectEvent: (itemId: string) =>
        set((state: CalendarState) => {
          const newEvents = [...state.events];
          const sourceEventIndex = newEvents.findIndex((d) => d.id === itemId);
          const event = newEvents[sourceEventIndex];
          event.editable = false;
          reOrderLayers(newEvents, event);
          return { events: newEvents };
        }),
      editEvent: (eventId: string, event: EventItem) =>
        set((state: CalendarState) => {
          const newEvents = [...state.events];
          const eventIndex = newEvents.findIndex((d) => d.id === eventId);
          newEvents[eventIndex] = event;
          return {
            events: newEvents,
            pendingChanges: state.pendingChanges + 1,
          };
        }),
      deleteEvent: (eventId: string) =>
        set((state: CalendarState) => {
          let newEvents = [...state.events];
          const newEventIndex = newEvents.findIndex((i) => i.id === eventId);
          newEvents[newEventIndex].softDelete = true;

          return {
            events: newEvents,
            pendingChanges: state.pendingChanges + 1,
          };
        }),
      addDayContent: (
        selDay: number,
        selMonth: number,
        setYear: number,
        itemId: string
      ) =>
        set((state: CalendarState) => {
          const item: GenericItem = {
            id: itemId || Date.now().toString(),
            type: "post-it",
            content: "new item",
            x: 0,
            y: 0,
            order: 0,
          };

          const day = selDay || state.selectedDay.getDate();
          const month = selMonth || state.selectedDay.getMonth();
          const year = setYear || state.selectedDay.getFullYear();

          const newDays = [...state.days];
          let dayItemIndex = newDays.findIndex(
            (d) => d.day === day && d.month === month + 1 && d.year === year
          );
          let dayItem: Schedule;
          if (dayItemIndex == -1) {
            dayItem = {
              day: day,
              year: year,
              month: month + 1,
              items: [],
              type: "day",
              calendarId: "test",
            };
          } else {
            [dayItem] = newDays.splice(dayItemIndex, 1);
          }
          item.order = dayItem.items.length;

          dayItem.items.push(item);
          reOrderAll(dayItem.items);
          newDays.push(dayItem);
          return { days: newDays, pendingChanges: state.pendingChanges + 1 };
        }),
      reorderDays: (
        itemId: string,
        overId: number,
        delta: Delta,
        day: number,
        month: number,
        year: number
      ) =>
        set((state: CalendarState) => {
          const newDays = [...state.days];
          const sourceDayIndex = newDays.findIndex(
            (d) => d.items.findIndex((i) => i.id == itemId) > -1
          );
          if (sourceDayIndex === -1) {
            // try to find in toolbars
            const newToolbarItems = [...state.toolbarItems];
            const toolbarIndex = newToolbarItems.findIndex(
              (d) => d.id === itemId
            );
            if (toolbarIndex > -1) {
              //
              const item = newToolbarItems[toolbarIndex];
              newToolbarItems[toolbarIndex] = {
                id: Date.now().toString(),
                type: item.type,
                content: item.content,
                x: 0,
                y: 0,
                order: 0,
                color: item.color,
              };
              let targetDay: Schedule | undefined = newDays.find(
                (d) =>
                  d.day === overId && d.month === month + 1 && d.year === year
              );
              if (!targetDay) {
                targetDay = {
                  day: overId,
                  month: month + 1,
                  year: year,
                  items: [],
                  type: "day",
                  calendarId: "test",
                };
                newDays.push(targetDay);
              }

              targetDay.softDelete = false;

              item.x = delta.x * 100;
              item.y = delta.y * 100;
              targetDay.items.push(item);
              reOrderLayers(targetDay.items, item);

              return {
                days: newDays,
                toolbarItems: newToolbarItems,
                pendingChanges: state.pendingChanges + 1,
              };
            } else {
              return { ...state };
            }
          } else {
            const day = newDays[sourceDayIndex];
            const sourceIndex = day.items.findIndex((i) => i.id == itemId);
            const item = day.items[sourceIndex];

            if (day.day !== overId) {
              day.items.splice(sourceIndex, 1);
              day.softDelete = day.items.length === 0;
              let targetDay = newDays.find(
                (d) =>
                  d.day === overId && d.month === month + 1 && d.year === year
              );
              if (!targetDay) {
                targetDay = {
                  day: overId,
                  month: month + 1,
                  year: year,
                  type: "day",
                  items: [],
                };
                newDays.push(targetDay);
              }

              targetDay.softDelete = false;
              item.x = delta.x * 100;
              item.y = delta.y * 100;
              targetDay.items.push(item);
              reOrderLayers(targetDay.items, item);
              reOrderAll(day.items);
            } else {
              item.x = delta.x * 100;
              item.y = delta.y * 100;
              reOrderLayers(day.items, item);
            }
            return { days: newDays, pendingChanges: state.pendingChanges + 1 };
          }
        }),
      reorderEvents: (
        itemId: string,
        overId: number,
        day: number,
        month: number,
        year: number,
        isStart: boolean,
        isEnd: boolean,
        delta: Delta,
        action: string
      ) =>
        set((state: CalendarState) => {
          const newEvents = [...state.events];
          let event = newEvents.find((e) => e.id === itemId);
          if (!event) {
            const newToolbarItems = [...state.toolbarItems];
            // look in toolbar
            const itemIndex = newToolbarItems.findIndex(
              (e) => e.id === itemId && e.type === "event"
            );
            if (itemIndex === -1) return state;
            event = newToolbarItems[itemIndex] as EventItem;
            event.day = overId;
            event.days = 1;
            event.year = year;
            event.month = month + 1;
            event.y = delta.y * 100;
            newEvents.push(event);
            newToolbarItems[itemIndex] = {
              id: `${Date.now()}`,
              type: "event",
              content: "new event",
              x: 0,
              y: 0,
              order: 0,
              color: "blue",
            };
            reOrderLayers(newEvents, event);
            return { events: newEvents, toolbarItems: newToolbarItems };
          }

          if (action === "move") {
            // move the event start day to selected day
            event.day = overId;

            // if the event goes past end of the month, trim the days.
            const overlap = event.day + event.days - getDaysInMonth(state);
            if (overlap > 0) {
              event.days = event.days - overlap;
            }

            event.y = delta.y * 100;
            reOrderLayers(newEvents, event);
            return { events: newEvents };
          }

          if (isStart && !isEnd && overId > event.day + event.days) {
            return state;
          }
          if (isEnd && !isStart && overId < event.day) {
            return state;
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
          // event.y = delta.y * 100;
          reOrderLayers(newEvents, event);
          return {
            events: newEvents,
            pendingChanges: state.pendingChanges + 1,
          };
        }),
      syncItem: async (updatedItem: Schedule | EventItem, id: string) => {
        console.log("syncing item");
        return await fetch(`/api/update/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });
      },
      deleteDay: async (updatedItem: Schedule | EventItem, id: string) => {
        return await fetch(`/api/days/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedItem),
        });
      },
      fetch: async (id: string) => {
        const response = await fetch(`/api/days/${id}`);
        const allData = await response.json();
        const days = allData.filter(
          (r: Schedule | EventItem) => r.type === "day"
        );
        const events = allData.filter(
          (r: Schedule | EventItem) => r.type === "event"
        );
        set({ days, events, pendingChanges: 0 });
      },
      sync: async (id: string) => {
        const { days, events, syncItem, deleteDay } = get() as CalendarState;
        const savedDays = [];
        const savedEvents = [];
        for (var i = 0; i < days.length; i++) {
          const item = days[i];
          if (item.softDelete) {
            await deleteDay(item, id);
          } else {
            const res = await syncItem(item, id);
            const resObj = await res.json();
            savedDays.push(resObj);
          }
        }

        for (var i = 0; i < events.length; i++) {
          const item = events[i];
          if (item.softDelete) {
            await deleteDay(item, id);
          } else {
            const res = await syncItem(item, id);
            const resObj = await res.json();
            savedEvents.push(resObj);
          }
        }

        set({ days: savedDays, events: savedEvents, pendingChanges: 0 });
      },
    }),
    {
      name: "calendar-storage",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return {
            state: {
              ...JSON.parse(str).state,
              selectedDay: new Date(JSON.parse(str).state.selectedDay),
            },
          };
        },
        setItem: (name, newValue) => {
          const str = JSON.stringify({
            state: {
              ...newValue.state,
            },
          });
          localStorage.setItem(name, str);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export {
  useCalendarStore,
  getCurrentDay,
  getMonth,
  getYear,
  getDaysContent,
  getDaysInMonth,
  getDaysEvents,
};
