import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { Delta } from "@/components/Delta";
import calendarService from "@/helpers/calendarService";
import { reOrderAll, reOrderLayers } from "@/utils/layers";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { CalendarDay, EventItem, GenericItem, Person } from "@/types/Items";
import { UpdateDaysAction } from "@/helpers/serverActions/days";

export interface CalendarProps {
  days: CalendarDay[];
  events: EventItem[];
  editDaysAction?: (days: CalendarDay[]) => Promise<CalendarDay[] | undefined>;
  editEventsAction?: (events: EventItem[]) => Promise<EventItem[] | undefined>;
}

export interface CalendarState extends CalendarProps {
  toolbarItems: GenericItem[];
  selectedDay: Date;
  pendingChanges: number;
  locked: boolean;
  selectedItem: GenericItem | null;
  updateSelectedItem: (item: Partial<GenericItem>) => void;
  setLocked: (locked: boolean) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  setSelectedDay: (selectedDay: Date) => void;
  setDays: (days: CalendarDay[]) => void;
  addDay: (day: CalendarDay) => void;
  editDay: (itemId: string, newItem: GenericItem) => void;
  setDay: (day: CalendarDay) => void;
  deleteItem: (itemId: string) => void;
  selectItem: (itemId: string) => void;
  deselectItem: () => void;
  selectEvent: (itemId: string) => void;
  deselectEvent: (itemId: string) => void;
  editEvent: (eventId: string, event: EventItem) => void;
  setEvents: (events: EventItem[]) => void;
  deleteEvent: (itemId: string) => void;
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
    updatedItem: CalendarDay | EventItem,
    id: string
  ) => Promise<Response>;
  assignPerson: (itemId: string, person: Person) => void;
  removePerson: (sourceId: string, person: Person) => void;
  syncItem: (
    updatedItem: CalendarDay | EventItem,
    id: string
  ) => Promise<Response>;
  sync: (
    id: string,
    updateDays: UpdateDaysAction,
    updateEvents: (
      calendarId: string,
      events: EventItem[],
      path?: string
    ) => Promise<EventItem[]>
  ) => void;
}

export type CalendarStore = ReturnType<typeof createCalendarStore>;

export const createCalendarStore = (initProps?: CalendarProps) => {
  const DEFAULT: CalendarProps = {
    days: [],
    events: [],
  };

  return createStore<CalendarState>()((set, get, ...s) => ({
    ...DEFAULT,
    ...initProps,
    pendingChanges: 0,
    toolbarItems: calendarService.toolbarItems,
    selectedDay: new Date(),
    locked: false,
    selectedItem: null,
    setLocked: (locked: boolean) =>
      set((state: CalendarState) => {
        const { days, events } = state;
        days.forEach((d) => {
          d.items.forEach((i) => {
            i.editable = false;
          });
        });
        events.forEach((e) => {
          e.editable = false;
        });
        return { locked, days, events };
      }),
    nextMonth: () =>
      set((state: CalendarState) => ({
        selectedDay: calendarService.adjustDateByMonth(
          state.selectedDay.getMonth() + 1,
          state.selectedDay
        ),
      })),
    prevMonth: () =>
      set((state: CalendarState) => ({
        selectedDay: calendarService.adjustDateByMonth(
          state.selectedDay.getMonth() - 1,
          state.selectedDay
        ),
      })),
    setSelectedDay: (selectedDay: Date) => set(() => ({ selectedDay })),
    setDays: (days: CalendarDay[]) =>
      set(({ pendingChanges }) => ({
        days,
        pendingChanges: pendingChanges + 1,
      })),
    setDay: (day: CalendarDay) =>
      set((state: CalendarState) => {
        const { days } = state;
        const index = days.findIndex(
          (d) =>
            d.day === day.day && d.month === day.month && d.year === day.year
        );
        days[index] = day;
        return { days };
      }),
    addDay: (day: CalendarDay) =>
      set((state: CalendarState) => ({ days: [...state.days, day] })),
    editDay: (itemId: string, newItem: GenericItem) =>
      set((state: CalendarState) => {
        const { days } = state;
        const sourceDayIndex = days.findIndex(
          (d) => d.items.findIndex((i) => i.id === itemId) > -1
        );
        const day = days[sourceDayIndex];
        const sourceIndex = day.items.findIndex((i) => i.id === itemId);
        day.items[sourceIndex] = newItem;
        return { days };
      }),
    deleteItem: (itemId: string) =>
      set((state: CalendarState) => {
        const { days } = state;
        const sourceDayIndex = days.findIndex(
          (d) => d.items.findIndex((i) => i.id === itemId) > -1
        );
        const day = days[sourceDayIndex];
        const sourceIndex = day.items.findIndex((i) => i.id === itemId);
        day.items = [
          ...day.items.slice(0, sourceIndex),
          ...day.items.slice(sourceIndex + 1),
        ];

        day.softDelete = day.items.length === 0;
        day.dirty = true;

        reOrderAll(day.items);
        return { days, pendingChanges: state.pendingChanges + 1 };
      }),
    selectItem: (itemId: string) =>
      set((state: CalendarState) => {
        const { days } = state;
        const sourceDayIndex = days.findIndex(
          (d) => d.items.findIndex((i) => i.id === itemId) > -1
        );
        const day = days[sourceDayIndex];
        const { item } = calendarService.findItem(day.items, itemId);
        reOrderLayers(day.items, item);
        return { days, selectedItem: { ...item } };
      }),
    deselectItem: () => {
      set({
        selectedItem: null,
      });
    },
    setEvents: (events: EventItem[]) =>
      set(({ pendingChanges }) => ({
        events,
        pendingChanges: pendingChanges + 1,
      })),
    selectEvent: (itemId: string) =>
      set((state: CalendarState) => {
        const { events } = state;
        const sourceEventIndex = events.findIndex((d) => d.id === itemId);
        const event = events[sourceEventIndex];
        event.editable = true;
        reOrderLayers(events, event);
        return { events };
      }),
    deselectEvent: (itemId: string) =>
      set((state: CalendarState) => {
        const { events } = state;
        const sourceEventIndex = events.findIndex((d) => d.id === itemId);
        const event = events[sourceEventIndex];
        event.editable = false;
        reOrderLayers(events, event);
        return { events };
      }),
    editEvent: (eventId: string, event: EventItem) =>
      set((state: CalendarState) => {
        const { events } = state;
        const eventIndex = events.findIndex((d) => d.id === eventId);
        events[eventIndex] = event;
        return {
          events,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    deleteEvent: (eventId: string) =>
      set((state: CalendarState) => {
        let { events } = state;
        const newEventIndex = events.findIndex((i) => i.id === eventId);
        events[newEventIndex].softDelete = true;

        return {
          events,
          pendingChanges: state.pendingChanges + 1,
        };
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
        const { days } = calendarService.reorderDays(
          itemId,
          overId,
          delta,
          month,
          year,
          state.days,
          state.toolbarItems
        );
        return {
          days,
          pendingChanges: state.pendingChanges + 1,
        };
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
        const { events } = calendarService.reorderEvents(
          state.events,
          itemId,
          overId,
          month,
          year,
          isStart,
          isEnd,
          delta,
          action,
          state.toolbarItems,
          state.selectedDay
        );
        return {
          events,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    removePerson: (sourceId: string, person: Person) => {
      set((state: CalendarState) => {
        let targetItem: EventItem | GenericItem | null = null;
        const newDays = [...state.days];
        const newEvents = [...state.events];
        const sourceDayIndex = newDays.findIndex(
          (d) => d.items.findIndex((i) => i.id == sourceId) > -1
        );

        const day = newDays[sourceDayIndex];
        if (sourceDayIndex === -1) {
          // look in events

          const sourceEventIndex = newEvents.findIndex(
            (d) => d.id === sourceId
          );
          targetItem = newEvents[sourceEventIndex];
        } else {
          const { item } = calendarService.findItem(day.items, sourceId);
          targetItem = item;
        }

        if (!targetItem) return state;

        if (!targetItem.people) targetItem.people = [];
        if (targetItem.people.includes(person.id)) {
          targetItem.people = targetItem.people.filter((p) => p !== person.id);
        }
        return { days: newDays, events: newEvents };
      });
    },
    assignPerson: (itemId: string, person: Person) => {
      set((state: CalendarState) => {
        let targetItem: EventItem | GenericItem | null = null;
        const newDays = [...state.days];
        const newEvents = [...state.events];
        const sourceDayIndex = newDays.findIndex(
          (d) => d.items.findIndex((i) => i.id == itemId) > -1
        );

        const day = newDays[sourceDayIndex];
        if (sourceDayIndex === -1) {
          // look in events
          const sourceEventIndex = newEvents.findIndex((d) => d.id === itemId);
          targetItem = newEvents[sourceEventIndex];
        } else {
          const { item } = calendarService.findItem(day.items, itemId);
          targetItem = item;
        }

        if (!targetItem) return state;

        if (!targetItem.people) targetItem.people = [];
        if (targetItem.people.includes(person.id)) {
          targetItem.people = targetItem.people.filter((p) => p !== person.id);
        } else {
          targetItem.people.push(person.id);
        }
        return { days: newDays, events: newEvents };
      });
    },
    syncItem: async (updatedItem: CalendarDay | EventItem, id: string) => {
      return await fetch(`/api/update/${id}/${updatedItem.type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
    },
    deleteDay: async (updatedItem: CalendarDay | EventItem, id: string) => {
      return await fetch(`/api/days/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
    },
    updateSelectedItem: (item: Partial<GenericItem>) =>
      set((state: CalendarState) => {
        const { selectedItem } = state;
        if (!selectedItem) return state;
        return {
          selectedItem: { ...selectedItem, ...item },
        };
      }),
    sync: async (id: string, updateDays, updateEvents) => {
      const { days, events } = get() as CalendarState;
      days.forEach((d) => {
        d.items.forEach((i) => {
          i.editable = false;
        });
      });
      events.forEach((e) => {
        e.editable = false;
      });

      const updatedDays = days.filter((d) => d.dirty);
      const updatedEvents = events.filter((e) => e.dirty);

      let savedDays: CalendarDay[] = days;
      let savedEvents: EventItem[] = events;

      if (updatedDays.length > 0) {
        savedDays = await updateDays(id, updatedDays);
      }

      if (updatedEvents.length > 0) {
        savedEvents = await updateEvents(id, updatedEvents);
      }

      set({ days: savedDays, events: savedEvents, pendingChanges: 0 });
    },
  }));
};

export const CalendarContext = createContext<CalendarStore | null>(null);

function useCalendarContext<T>(
  selector: (state: CalendarState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(CalendarContext);
  if (!store) throw new Error("Missing CalendarContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}

export { useCalendarContext };
