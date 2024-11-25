import { Delta } from "@/components/Delta";
import {
  CalendarItem,
  GenericItem,
  Person,
  ScheduleItem,
  Section,
  Template,
} from "@/types/Items";
import { v4 as uuidv4 } from "uuid";
import scheduleService from "./scheduleService";
const { findSection, findDay } = scheduleService;

type reorderTemplateFunc = (
  itemId: string,
  targetDay: number,
  targetSection: string,
  delta: Delta,
  template: Template,
  toolbarItems: CalendarItem[]
) => {
  template: Template;
  source: ScheduleItem | null;
  target: ScheduleItem;
};

export interface TemplateService {
  findItemInTemplate: (
    itemId: string,
    template: Template
  ) => GenericItem | null;
  reorderTemplate: reorderTemplateFunc;
}

const findItemInTemplate = (itemId: string, template: Template) => {
  const schedule = template.schedule;
  for (var j = 0; j < schedule.length; j++) {
    const day = schedule[j];
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
  return null;
};

const reorderTemplate: reorderTemplateFunc = (
  itemId,
  targetDay,
  targetSection,
  delta,
  template,
  toolbarItems
) => {
  const { dayIndex, section, sectionIndex } = findDay(
    itemId,
    template.schedule
  );

  let source: CalendarItem | null = null;

  if (dayIndex === null) {
    const toolbarIndex = toolbarItems.findIndex((d) => d.id === itemId);
    if (toolbarIndex > -1) {
      source = { ...toolbarItems[toolbarIndex] };
      source.id = uuidv4();
    }
  } else {
    if (!section || sectionIndex == null)
      throw new Error("Invalid section or section index");
    const sectionKey = section as Section;
    source = template.schedule[dayIndex][sectionKey].items[sectionIndex];
    template.schedule[dayIndex][sectionKey].items.splice(sectionIndex, 1);
  }

  if (!source) throw new Error("Item not found");

  const templateItem = source;
  templateItem.x = delta.x * 100;
  templateItem.y = delta.y * 100;

  let targetDayObj = template.schedule.find((d) => d.day === targetDay + 1);
  if (!targetDayObj) {
    targetDayObj = {
      day: targetDay + 1,
      morning: { items: [], status: "saved" },
      afternoon: { items: [], status: "saved" },
      evening: { items: [], status: "saved" },
    };
    template.schedule.push(targetDayObj);
  }
  const targetSectionProperty = findSection(
    targetSection as "morning" | "afternoon" | "evening",
    targetDayObj
  );

  targetSectionProperty.items.push(source);
  const sourceDayObj = dayIndex ? template.schedule[dayIndex] : null;

  return {
    template,
    source: sourceDayObj,
    target: targetDayObj,
  };
};

const templateService: TemplateService = {
  findItemInTemplate,
  reorderTemplate: reorderTemplate,
};

export default templateService;
