import { createStore } from "zustand";
import { Delta } from "@/components/Delta";
import {
  GenericItem,
  ScheduleItem,
  ScheduleSection,
  Section,
  Template,
} from "@/types/Items";
import { createContext, useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import scheduleService from "@/utils/scheduleService";
import { reOrderAll, reOrderLayers } from "@/utils/layers";

const { findDay, toolbarItems } = scheduleService;

export interface TemplateProps {
  templates: Template[];
}

export interface TemplateState {
  templates: Template[];
  toolbarItems: GenericItem[];
  pendingChanges: number;
  deleteTemplateItem: (itemId: string, templateId: string) => void;
  editTemplate: (templateId: string, newTemplate: Template) => void;
  editTemplateItem: (
    templateId: string,
    itemId: string,
    newItem: GenericItem
  ) => void;
  reorderTemplate: (
    templateId: string,
    itemId: string,
    targetDay: number,
    targetSection: Section,
    delta: Delta
  ) => void;
  createTemplate: (calendarId: string) => void;
  deleteTemplate: (templateId: string) => void;
  selectTemplateItem: (itemId: string, templateId: string) => void;
  deselectTemplateItem: (itemId: string, templateId: string) => void;
  syncItem: (updatedItem: any, calendarId: string) => Promise<any>;
  deleteItem: (updatedItem: any, calendarId: string) => Promise<any>;
  fetch: (calendarId: string) => Promise<void>;
  sync: (calendarId: string) => Promise<void>;
}

const findItem = (items: GenericItem[], itemId: string) => {
  const itemIndex = items.findIndex((i) => i.id === itemId);
  return { item: items[itemIndex], index: itemIndex };
};
export type TemplateStore = ReturnType<typeof createTemplateStore>;

export const createTemplateStore = (initProps?: TemplateProps) => {
  const DEFAULT: TemplateProps = {
    templates: [],
  };

  return createStore<TemplateState>()((set, get) => ({
    ...DEFAULT,
    ...initProps,
    toolbarItems: toolbarItems,
    pendingChanges: 0,
    deleteTemplateItem: (itemId: string, templateId: string) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];
        const newTemplate = newTemplates.find(
          (n) => n.id === templateId
        )!.schedule;
        const { dayIndex, section, sectionIndex } = findDay(
          itemId,
          newTemplate
        );
        if (dayIndex === null) return state;
        if (sectionIndex === null) return state;
        const sectionKey = section as keyof ScheduleItem;
        const newSection = newTemplate[dayIndex][sectionKey] as ScheduleSection;
        const templateItem = newTemplate[dayIndex];
        if (sectionKey === "morning") {
          templateItem.morning.items = [
            ...newSection.items.slice(0, sectionIndex),
            ...newSection.items.slice(sectionIndex + 1),
          ];
        }
        if (sectionKey === "afternoon") {
          templateItem.afternoon.items = [
            ...newSection.items.slice(0, sectionIndex),
            ...newSection.items.slice(sectionIndex + 1),
          ];
        }
        if (sectionKey === "evening") {
          templateItem.evening.items = [
            ...newSection.items.slice(0, sectionIndex),
            ...newSection.items.slice(sectionIndex + 1),
          ];
        }

        reOrderAll(
          (newTemplate[dayIndex][sectionKey] as ScheduleSection).items
        );
        return {
          templates: newTemplates,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    editTemplate: (templateId: string, newTemplate: Template) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];

        if (!templateId) {
          // create new
          const template = {
            id: Date.now(),
            name: "",
            schedule: [],
          };

          newTemplates.push({ ...template, ...newTemplate });
        } else {
          const newTemplateIndex = newTemplates.findIndex(
            (n) => n.id === templateId
          );
          newTemplates[newTemplateIndex] = newTemplate;
        }

        return {
          templates: newTemplates,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    editTemplateItem: (
      templateId: string,
      itemId: string,
      newItem: GenericItem
    ) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];
        const newTemplateIndex = newTemplates.findIndex(
          (n) => n.id === templateId
        );

        const newTemplate = newTemplates[newTemplateIndex].schedule;

        const { dayIndex, section, sectionIndex } = findDay(
          itemId,
          newTemplate
        );

        if (dayIndex === null) return state;
        if (sectionIndex === null) return state;
        const sectionKey = section as keyof ScheduleItem;
        const sectionItems = newTemplate[dayIndex][
          sectionKey
        ] as ScheduleSection;
        sectionItems.items[sectionIndex] = newItem;
        reOrderAll(
          (newTemplate[dayIndex][sectionKey] as ScheduleSection).items
        );

        return {
          templates: newTemplates,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    reorderTemplate: (
      templateId: string,
      itemId: string,
      targetDay: number,
      targetSection: Section,
      delta: Delta
    ) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];
        const templateItemIndex = newTemplates.findIndex(
          (n) => n.id === templateId
        );
        let templateItem = null;
        if (templateItemIndex === -1) {
          templateItem = {
            id: templateId,
            name: "",
            type: "template",
            schedule: [],
          };
          newTemplates.push(templateItem);
        } else {
          templateItem = newTemplates[templateItemIndex];
        }

        const { dayIndex, section, sectionIndex } = findDay(
          itemId,
          templateItem?.schedule
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
            newState = {
              ...newState,
              toolbarItems: newToolbarItems,
              pendingChanges: state.pendingChanges + 1,
            };
          }
        } else {
          if (!templateItem) return state;
          if (!dayIndex) return state;
          if (!sectionIndex) return state;
          const sectionKey = section as keyof ScheduleItem;
          const sectionItems = templateItem.schedule[dayIndex][
            sectionKey
          ] as ScheduleSection;
          item = sectionItems.items[sectionIndex];
          const sourceDay = templateItem.schedule[dayIndex];
          (sourceDay[sectionKey] as ScheduleSection).items.splice(
            sectionIndex,
            1
          );
        }
        if (!item) return state;
        item.x = delta.x * 100;
        item.y = delta.y * 100;
        let targetDayObj = templateItem.schedule.find(
          (d) => d.day === targetDay + 1
        );
        if (!targetDayObj) {
          targetDayObj = {
            day: targetDay + 1,
            morning: { items: [], status: "saved" },
            afternoon: { items: [], status: "saved" },
            evening: { items: [], status: "saved" },
          };
          templateItem.schedule.push(targetDayObj);
        }
        const targetSectionKey = targetSection as keyof ScheduleItem;
        (targetDayObj[targetSectionKey] as ScheduleSection).items.push(item);
        newState = {
          ...newState,
          templates: newTemplates,
          pendingChanges: state.pendingChanges + 1,
        };
        return newState;
      }),
    createTemplate: (calendarId: string) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];
        // create new
        const template = {
          id: `${Date.now()}`,
          name: "new template",
          calendarId,
          schedule: [],
          type: "template",
        };
        newTemplates.push(template);

        return {
          templates: newTemplates,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    deleteTemplate: (templateId: string) =>
      set((state: TemplateState) => {
        let newTemplates = [...state.templates];
        const templateIndex = newTemplates.findIndex(
          (t) => t.id === templateId
        );
        newTemplates[templateIndex].softDelete = true;

        return {
          templates: newTemplates,
          pendingChanges: state.pendingChanges + 1,
        };
      }),
    selectTemplateItem: (itemId: string, templateId: string) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];
        const newTemplate = newTemplates.find(
          (n) => n.id === templateId
        )!.schedule;
        const { dayIndex, section, sectionIndex } = findDay(
          itemId,
          newTemplate
        );
        if (dayIndex === null) return state;
        const sectionKey = section as keyof ScheduleItem;
        const { item } = findItem(
          (newTemplate[dayIndex][sectionKey] as ScheduleSection).items,
          itemId
        );
        item.editable = true;
        reOrderLayers(
          (newTemplate[dayIndex][sectionKey] as ScheduleSection).items,
          item
        );
        return { templates: newTemplates };
      }),
    deselectTemplateItem: (itemId: string, templateId: string) =>
      set((state: TemplateState) => {
        const newTemplates = [...state.templates];
        const newTemplate = newTemplates.find(
          (n) => n.id === templateId
        )!.schedule;
        const { dayIndex, section, sectionIndex } = findDay(
          itemId,
          newTemplate
        );
        if (dayIndex === null) return state;
        const sectionKey = section as keyof ScheduleItem;
        const { item } = findItem(
          (newTemplate[dayIndex][sectionKey] as ScheduleSection).items,
          itemId
        );
        item.editable = false;
        reOrderLayers(
          (newTemplate[dayIndex][sectionKey] as ScheduleSection).items,
          item
        );
        return { templates: newTemplates };
      }),
    syncItem: async (updatedItem: Template, calendarId: string) => {
      return await fetch(`/api/update/${calendarId}/template`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
    },
    deleteItem: async (updatedItem: Template, calendarId: string) => {
      return await fetch(`/api/days/delete/${calendarId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
    },
    fetch: async (calendarId: string) => {
      const templateRequest = await fetch(`/api/template/${calendarId}`);
      const templates = await templateRequest.json();
      const schedulesRequest = await fetch(`/api/week/${calendarId}`);
      const schedules = await schedulesRequest.json();
      set({ templates, pendingChanges: 0 });
    },
    sync: async (calendarId: string) => {
      const { templates, syncItem, deleteItem } = get() as TemplateState;
      const savedTemplates = [];
      for (var i = 0; i < templates.length; i++) {
        const item = templates[i];
        if (item.softDelete) {
          await deleteItem(item, calendarId);
        } else {
          const res = await syncItem(item, calendarId);
          const resObj = await res.json();
          savedTemplates.push(resObj);
        }
      }
      set({
        templates: savedTemplates,
        pendingChanges: 0,
      });
    },
  }));
};

export const TemplateContext = createContext<TemplateStore | null>(null);

function useTemplateContext<T>(
  selector: (state: TemplateState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(TemplateContext);
  if (!store) throw new Error("Missing TemplateContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}

export { useTemplateContext };
