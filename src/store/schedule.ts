import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Delta } from "@/components/Delta";
import {
  GenericItem,
  Schedule,
  ScheduleItem,
  Section,
  Template,
} from "@/types/Items";

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
    id: `${Date.now()}-text`,
    type: "text",
    content: "new text",
    x: 0,
    y: 0,
    order: 0,
    color: "black",
  },
  {
    id: `${Date.now()}-card`,
    type: "post-card",
    content: "new post-card",
    x: 0,
    y: 0,
    order: 0,
    file: "",
  },
];

const reOrderLayers = (items: GenericItem[], itemId: string | number) => {
  if (items.length < 2) return items;
  const sourceIndex = items.findIndex((i) => i.id === itemId);
  const item = items[sourceIndex];
  const numItems = items.length;
  if (item.order === numItems - 1) return items;
  item.order = numItems - 1;
  const otherItems = items.filter((i) => i.id !== itemId);
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

export interface ScheduleState {
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
  deleteScheduleItem: (itemId: string, year: number, week: number) => void;
  selectItem: (itemId: string, year: number, week: number) => void;
  syncItem: (updatedItem: any, calendarId: string) => Promise<any>;
  deleteItem: (updatedItem: any, calendarId: string) => Promise<any>;
  applyTemplate: (template: ScheduleItem[], week: number, year: number) => void;
  fetch: (calendarId: string) => Promise<void>;
  sync: (calendarId: string) => Promise<void>;
}

const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      schedules: initialSchedules,
      toolbarItems: toolbarItems,
      pendingChanges: 0,
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
              newToolbarItems[toolbarIndex] = {
                ...item,
                id: Date.now().toString(),
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
          const newSection = newSchedule[dayIndex][sectionKey] as GenericItem[];
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
          reOrderLayers(
            newSchedule[dayIndex][sectionKey] as GenericItem[],
            itemId
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
        return await fetch(`/api/update/${calendarId}`, {
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
      fetch: async (calendarId: string) => {
        const schedulesRequest = await fetch(`/api/week/${calendarId}`);
        const schedules = await schedulesRequest.json();
        set({ schedules, pendingChanges: 0 });
      },

      sync: async (calendarId: string) => {
        const { schedules, syncItem, deleteItem } = get() as ScheduleState;
        const savedSchedules = [];
        for (var i = 0; i < schedules.length; i++) {
          const item = schedules[i];
          if (item.softDelete) {
            await deleteItem(item, calendarId);
          } else {
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

export { useScheduleStore };
