import { Delta } from "@/components/Delta";
import {
  GenericItem,
  Person,
  Schedule,
  ScheduleItem,
  ScheduleSection,
} from "@/types/Items";
import { v4 as uuidv4 } from "uuid";

type reorderScheduleFunc = (
  itemId: string,
  targetDay: number,
  targetSection: string,
  delta: Delta,
  year: number,
  week: number,
  schedules: Schedule[]
) => {
  schedules: Schedule[];
  source: ScheduleItem | null;
  target: ScheduleItem;
};

export interface ScheduleService {
  toolbarItems: GenericItem[];
  reorderSchedule: reorderScheduleFunc;
  cloneItems: (source: any, destination: any) => any;
  findItemInSchedules: (
    itemId: string,
    schedules: Schedule[]
  ) => GenericItem | null;
  findSection: (
    sectionKey: "morning" | "afternoon" | "evening",
    schedule: ScheduleItem
  ) => ScheduleSection;
  findDay: (
    itemId: string,
    schedule: ScheduleItem[]
  ) => {
    dayIndex: number | null;
    section: string | null;
    sectionIndex: number | null;
  };
  addPersonIfNotExists: (item: GenericItem, person: Person) => void;
  removePersonIfExists: (item: GenericItem, person: Person) => void;
  applyTemplate: (
    template: ScheduleItem[],
    schedules: Schedule[],
    week: number,
    year: number
  ) => Schedule;
}

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

const findDay = (itemId: string, schedule: ScheduleItem[]) => {
  for (var i = 0; i < schedule.length; i++) {
    const day = schedule[i];
    let sectionIndex = day.morning.items.findIndex((d) => d.id === itemId);
    if (sectionIndex > -1)
      return { dayIndex: i, section: "morning", sectionIndex };
    sectionIndex = day.afternoon.items.findIndex((d) => d.id === itemId);
    if (sectionIndex > -1)
      return { dayIndex: i, section: "afternoon", sectionIndex };
    sectionIndex = day.evening.items.findIndex((d) => d.id === itemId);
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
      for (var k = 0; k < day.morning.items.length; k++) {
        if (day.morning.items[k].id === itemId) return day.morning.items[k];
      }
      for (var k = 0; k < day.afternoon.items.length; k++) {
        if (day.afternoon.items[k].id === itemId) return day.afternoon.items[k];
      }
      for (var k = 0; k < day.evening.items.length; k++) {
        if (day.evening.items[k].id === itemId) return day.evening.items[k];
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

export const findSection: (
  sectionKey: "morning" | "afternoon" | "evening",
  schedule: ScheduleItem
) => ScheduleSection = (
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

const reorderSchedule: reorderScheduleFunc = (
  itemId,
  targetDay,
  targetSection,
  delta,
  year,
  week,
  schedules
) => {
  const scheduleItemIndex = schedules.findIndex(
    (n) => n.year === year && n.week === week
  );
  let scheduleItem = null;
  if (scheduleItemIndex === -1) {
    scheduleItem = { year, week, schedule: [], type: "schedule" };
    schedules.push(scheduleItem);
  } else {
    scheduleItem = schedules[scheduleItemIndex];
  }
  const { dayIndex, section, sectionIndex } = findDay(
    itemId,
    scheduleItem.schedule
  );

  let item = null;

  if (dayIndex === null) {
    // look in toolbar items
    const toolbarIndex = toolbarItems.findIndex((d) => d.id === itemId);
    if (toolbarIndex > -1) {
      item = { ...toolbarItems[toolbarIndex] };
      item.id = uuidv4();
    }
  } else {
    const sectionProperty = findSection(
      section as "morning" | "afternoon" | "evening",
      scheduleItem.schedule[dayIndex]
    );
    if (sectionProperty == null) throw new Error("Section not found");
    item = sectionProperty.items[sectionIndex];
    sectionProperty.items.splice(sectionIndex, 1);
  }

  if (item === null) throw new Error("Item not found");
  const templateItem = item as GenericItem;

  templateItem.x = delta.x * 100;
  templateItem.y = delta.y * 100;
  let targetDayObj = scheduleItem.schedule.find((d) => d.day === targetDay + 1);
  if (!targetDayObj) {
    targetDayObj = {
      day: targetDay + 1,
      morning: { items: [], status: "saved" },
      afternoon: { items: [], status: "saved" },
      evening: { items: [], status: "saved" },
    };
    scheduleItem.schedule.push(targetDayObj);
  }
  const targetSectionProperty = findSection(
    targetSection as "morning" | "afternoon" | "evening",
    targetDayObj
  );
  targetSectionProperty.items.push(item as GenericItem);

  return {
    schedules,
    source: dayIndex ? scheduleItem.schedule[dayIndex] : null,
    target: targetDayObj,
  };
};

const applyTemplate = (
  template: ScheduleItem[],
  schedules: Schedule[],
  week: number,
  year: number
) => {
  const schedule = schedules.find((s) => s.year === year && s.week === week);
  let mergedSchedule: Schedule;

  if (!schedule) {
    mergedSchedule = {
      week,
      year,
      schedule: [],
      type: "schedule",
    };
    schedules.push(mergedSchedule);
  } else {
    mergedSchedule = { ...schedule };
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
        morning: { items: [], status: "saved" },
        afternoon: { items: [], status: "saved" },
        evening: { items: [], status: "saved" },
      };
      mergedSchedule.schedule.push(existingDay);
    }

    cloneItems(daySchedule.morning.items, existingDay.morning.items);
    cloneItems(daySchedule.afternoon.items, existingDay.afternoon.items);
    cloneItems(daySchedule.evening.items, existingDay.evening.items);
  }

  return mergedSchedule;
};

const scheduleService: ScheduleService = {
  toolbarItems,
  reorderSchedule,
  cloneItems,
  findItemInSchedules,
  findSection,
  findDay,
  addPersonIfNotExists,
  removePersonIfExists,
  applyTemplate,
};

export default scheduleService;
