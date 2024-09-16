import { createStore } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { Delta } from "@/components/Delta";
import {
  GenericItem,
  Person,
  Schedule,
  ScheduleItem,
  Section,
} from "@/types/Items";
import { createContext, useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { persist } from "zustand/middleware";

const initialSchedules: Schedule[] = [
  {
    year: 2024,
    week: 1,
    type: "schedule",
    schedule: [
      {
        day: 1,
        morning: [
          {
            id: uuidv4(),
            type: "post-it",
            content: "new post-it",
            x: 0,
            y: 0,
            order: 0,
          },
        ],
        afternoon: [
          {
            id: uuidv4(),
            type: "post-it",
            content: "new post-it",
            x: 0,
            y: 0,
            order: 1,
          },
          {
            id: uuidv4(),
            type: "text",
            content: "my text item",
            x: 0,
            y: 0,
            order: 2,
          },
        ],
        evening: [],
      },
    ],
  },
];

const toolbarItems: GenericItem[] = [
  {
    id: `${Date.now()}-post-it`,
    type: "post-it",
    content: "new post-it",
    x: 0,
    y: 0,
    order: 0,
    color: "#0096FF",
  },
  {
    id: `${Date.now()}-card`,
    type: "post-card",
    content: "new post-card",
    x: 0,
    y: 0,
    order: 0,
    color: "#FF00FF",
  },
];

const findItem = (items: GenericItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id == itemId);
  return { item: items[itemIndex], index: itemIndex };
};

const reOrderLayers = (items: GenericItem[], item: GenericItem) => {
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

const reOrderAll = (items: GenericItem[]) => {
  if (items.length < 2) return items;
  items.sort((a, b) => (a.order > b.order ? 1 : -1));
  for (var i = 0; i < items.length; i++) {
    items[i].order = i;
  }
};

const findDay = (itemId: string, schedule: ScheduleItem[]) => {
  for (var i = 0; i < schedule.length; i++) {
    const day = schedule[i];
    let sectionIndex = day.morning.findIndex((d) => d.id === itemId);
    if (sectionIndex > -1)
      return { dayIndex: i, section: "morning", sectionIndex };
    sectionIndex = day.afternoon.findIndex((d) => d.id === itemId);
    if (sectionIndex > -1)
      return { dayIndex: i, section: "afternoon", sectionIndex };
    sectionIndex = day.evening.findIndex((d) => d.id === itemId);
    if (sectionIndex > -1)
      return { dayIndex: i, section: "evening", sectionIndex };
  }

  return { dayIndex: null, section: null, sectionIndex: null };
};

const findItemInSchedules = (itemId: string, schedules: Schedule[]) => {
  for (var i = 0; i < schedules.length; i++) {
    const schedule = schedules[i];
    for (var j = 0; j < schedule.schedule.length; j++) {
      const day = schedule.schedule[j];
      for (var k = 0; k < day.morning.length; k++) {
        if (day.morning[k].id === itemId) return day.morning[k];
      }
      for (var k = 0; k < day.afternoon.length; k++) {
        if (day.afternoon[k].id === itemId) return day.afternoon[k];
      }
      for (var k = 0; k < day.evening.length; k++) {
        if (day.evening[k].id === itemId) return day.evening[k];
      }
    }
  }
  return null;
};

const cloneItems = (source: any, destination: any) => {
  for (var i = 0; i < source.length; i++) {
    const clone = { ...source[i] };
    clone.id = uuidv4();
    destination.push(clone);
  }

  return destination;
};

const findSection: (
  sectionKey: "morning" | "afternoon" | "evening",
  schedule: ScheduleItem
) => GenericItem[] = (
  sectionKey: "morning" | "afternoon" | "evening",
  schedule: ScheduleItem
) => {
  switch (sectionKey) {
    case "morning":
      return schedule.morning;
    case "afternoon":
      return schedule.afternoon;
    case "evening":
      return schedule.evening;
  }
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

export interface ScheduleProps {
  schedules: Schedule[];
}

export interface ScheduleState {
  year: number;
  week: number;
  schedules: Schedule[];
  toolbarItems: GenericItem[];
  pendingChanges: number;
  reorderSchedule: (
    itemId: string,
    targetDay: number,
    targetSection: Section,
    delta: Delta,
    year: number,
    week: number
  ) => void;
  editItem: (
    itemId: string,
    newItem: GenericItem,
    year: number,
    week: number
  ) => void;
  setWeek: (week: number) => void;
  setYear: (year: number) => void;
  deleteScheduleItem: (itemId: string, year: number, week: number) => void;
  selectItem: (itemId: string, year: number, week: number) => void;
  deselectItem: (itemId: string, year: number, week: number) => void;
  syncItem: (updatedItem: any, calendarId: string) => Promise<any>;
  deleteItem: (updatedItem: any, calendarId: string) => Promise<any>;
  applyTemplate: (template: ScheduleItem[], week: number, year: number) => void;
  assignPerson: (itemId: string, person: Person) => void;
  removePerson: (sourceId: string, person: Person) => void;
  fetch: (calendarId: string) => Promise<void>;
  sync: (calendarId: string, week: number, year: number) => Promise<void>;
}

export type ScheduleStore = ReturnType<typeof createScheduleStore>;

export const createScheduleStore = (initProps?: ScheduleProps) => {
  const DEFAULT: ScheduleProps = {
    schedules: initialSchedules,
  };

  return createStore<ScheduleState>()(
    persist(
      (set, get) => ({
        ...DEFAULT,
        ...initProps,
        toolbarItems,
        year: new Date().getFullYear(),
        week: 1,
        pendingChanges: 0,
        setYear: (year: number) => set({ year }),
        setWeek: (week: number) => set({ week }),
        reorderSchedule: (
          itemId: string,
          targetDay: number,
          targetSection: string,
          delta: Delta,
          year: number,
          week: number
        ) =>
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const scheduleItemIndex = newSchedules.findIndex(
              (n) => n.year === year && n.week === week
            );
            let scheduleItem = null;
            if (scheduleItemIndex === -1) {
              scheduleItem = { year, week, schedule: [], type: "schedule" };
              newSchedules.push(scheduleItem);
            } else {
              scheduleItem = newSchedules[scheduleItemIndex];
            }
            const { dayIndex, section, sectionIndex } = findDay(
              itemId,
              scheduleItem.schedule
            );

            let item = null;
            let newState = {};

            if (dayIndex === null) {
              // look in toolbar items
              const newToolbarItems = [...state.toolbarItems];
              const toolbarIndex = newToolbarItems.findIndex(
                (d) => d.id === itemId
              );
              if (toolbarIndex > -1) {
                item = newToolbarItems[toolbarIndex];
                const toolbarId = item.id;
                item.id = uuidv4();
                newToolbarItems[toolbarIndex] = {
                  ...item,
                  id: toolbarId,
                };
                newState = { ...newState, toolbarItems: newToolbarItems };
              }
            } else {
              const sectionProperty = findSection(
                section as "morning" | "afternoon" | "evening",
                scheduleItem.schedule[dayIndex]
              );
              if (sectionProperty == null) return state;
              item = sectionProperty[sectionIndex];
              sectionProperty.splice(sectionIndex, 1);
            }

            if (item === null) return state;
            const templateItem = item as GenericItem;

            templateItem.x = delta.x * 100;
            templateItem.y = delta.y * 100;
            let targetDayObj = scheduleItem.schedule.find(
              (d) => d.day === targetDay + 1
            );
            if (!targetDayObj) {
              targetDayObj = {
                day: targetDay + 1,
                morning: [],
                afternoon: [],
                evening: [],
              };
              scheduleItem.schedule.push(targetDayObj);
            }
            const targetSectionProperty = findSection(
              targetSection as "morning" | "afternoon" | "evening",
              targetDayObj
            );
            targetSectionProperty.push(item as GenericItem);
            newState = {
              ...newState,
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
            return newState;
          }),
        editItem: (
          itemId: string,
          newItem: GenericItem,
          year: number,
          week: number
        ) =>
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const newSchedule = newSchedules.find(
              (n) => n.year === year && n.week === week
            )!.schedule;
            const { dayIndex, section, sectionIndex } = findDay(
              itemId,
              newSchedule
            );
            if (dayIndex === null) return state;
            const sectionKey = section as keyof (typeof newSchedule)[0];
            const items = newSchedule[dayIndex][sectionKey] as GenericItem[];
            items[sectionIndex] = newItem;
            reOrderAll(newSchedule[dayIndex][sectionKey] as GenericItem[]);
            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          }),
        deleteScheduleItem: (itemId: string, year: number, week: number) =>
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const newSchedule = newSchedules.find(
              (n) => n.year === year && n.week === week
            )!.schedule;
            const { dayIndex, section, sectionIndex } = findDay(
              itemId,
              newSchedule
            );
            if (dayIndex === null) return state;
            const sectionKey = section as keyof ScheduleItem;
            const newSection = newSchedule[dayIndex][
              sectionKey
            ] as GenericItem[];
            const splicednewSection = [
              ...newSection.slice(0, sectionIndex),
              ...newSection.slice(sectionIndex + 1),
            ];
            const schedule = newSchedule[dayIndex];
            if (sectionKey === "morning") {
              schedule.morning = splicednewSection;
            }
            if (sectionKey === "afternoon") {
              schedule.afternoon = splicednewSection;
            }
            if (sectionKey === "evening") {
              schedule.evening = splicednewSection;
            }

            reOrderAll(newSchedule[dayIndex][sectionKey] as GenericItem[]);
            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          }),
        selectItem: (itemId: string, year: number, week: number) =>
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const newSchedule = newSchedules.find(
              (n) => n.year === year && n.week === week
            )!.schedule;
            const { dayIndex, section, sectionIndex } = findDay(
              itemId,
              newSchedule
            );
            if (dayIndex === null) return state;
            const sectionKey = section as keyof ScheduleItem;
            const { item } = findItem(
              newSchedule[dayIndex][sectionKey] as GenericItem[],
              itemId
            );
            item.editable = true;
            reOrderLayers(
              newSchedule[dayIndex][sectionKey] as GenericItem[],
              item
            );
            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          }),
        deselectItem: (itemId: string, year: number, week: number) =>
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const newSchedule = newSchedules.find(
              (n) => n.year === year && n.week === week
            )!.schedule;
            const { dayIndex, section, sectionIndex } = findDay(
              itemId,
              newSchedule
            );
            if (dayIndex === null) return state;
            const sectionKey = section as keyof ScheduleItem;
            const { item } = findItem(
              newSchedule[dayIndex][sectionKey] as GenericItem[],
              itemId
            );
            item.editable = false;
            reOrderLayers(
              newSchedule[dayIndex][sectionKey] as GenericItem[],
              item
            );
            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          }),
        applyTemplate: (template: ScheduleItem[], week: number, year: number) =>
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];

            let mergedSchedule = newSchedules.find(
              (s) => s.year === year && s.week === week
            );

            if (!mergedSchedule) {
              mergedSchedule = {
                week,
                year,
                schedule: [],
                type: "schedule",
              };
              newSchedules.push(mergedSchedule);
            }
            // Add template items to schedule
            for (var i = 0; i < template.length; i++) {
              var daySchedule = template[i];
              let existingDay = mergedSchedule.schedule.find(
                (m: ScheduleItem) => m.day === daySchedule.day
              );

              if (!existingDay) {
                existingDay = {
                  day: daySchedule.day,
                  morning: [],
                  afternoon: [],
                  evening: [],
                };
                mergedSchedule.schedule.push(existingDay);
              }

              cloneItems(daySchedule.morning, existingDay.morning);
              cloneItems(daySchedule.afternoon, existingDay.afternoon);
              cloneItems(daySchedule.evening, existingDay.evening);
            }

            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          }),
        syncItem: async (updatedItem: Schedule, calendarId: string) => {
          return await fetch(`/api/update/${calendarId}/schedule`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedItem),
          });
        },
        deleteItem: async (updatedItem: Schedule, calendarId: string) => {
          return await fetch(`/api/days/delete/${calendarId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedItem),
          });
        },
        assignPerson: (itemId: string, person: Person) => {
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const item = findItemInSchedules(itemId, newSchedules);
            if (!item) return state;
            addPersonIfNotExists(item, person);

            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          });
        },
        removePerson: (sourceId: string, person: Person) => {
          set((state: ScheduleState) => {
            const newSchedules = [...state.schedules];
            const item = findItemInSchedules(sourceId, newSchedules);
            if (!item) return state;
            removePersonIfExists(item, person);

            return {
              schedules: newSchedules,
              pendingChanges: state.pendingChanges + 1,
            };
          });
        },
        fetch: async (calendarId: string) => {
          const schedulesRequest = await fetch(`/api/week/${calendarId}`);
          const schedules = await schedulesRequest.json();
          set({ schedules, pendingChanges: 0 });
        },

        sync: async (calendarId: string, week: number, year: number) => {
          const { schedules, syncItem, deleteItem } = get() as ScheduleState;
          const savedSchedules = [];
          for (var i = 0; i < schedules.length; i++) {
            const item = schedules[i];
            if (item.softDelete) {
              await deleteItem(item, calendarId);
            } else {
              item.week = week;
              item.year = year;
              const res = await syncItem(item, calendarId);
              const resObj = await res.json();
              savedSchedules.push(resObj);
            }
          }
          set({
            schedules: savedSchedules,
            pendingChanges: 0,
          });
        },
      }),
      {
        name: "schedule-storage",
        partialize: (state) => ({
          year: state.year,
          week: state.week,
        }),
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
};

export const ScheduleContext = createContext<ScheduleStore | null>(null);

function useScheduleContext<T>(
  selector: (state: ScheduleState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(ScheduleContext);
  if (!store) throw new Error("Missing ScheduleContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}

export { useScheduleContext };
