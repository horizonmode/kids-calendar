import { createStore } from "zustand";
import {
  GenericItem,
  ScheduleItem,
  ScheduleSection,
  Template,
} from "@/types/Items";
import { createContext, useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import scheduleService from "@/utils/scheduleService";
import { reOrderAll } from "@/utils/layers";

const { findDay } = scheduleService;

export interface TemplateProps {
  templates: Template[];
}

export interface TemplateState {
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  deleteTemplateItem: (itemId: string, templateId: string) => void;
  editTemplate: (templateId: string, newTemplate: Template) => void;
  editTemplateItem: (
    templateId: string,
    itemId: string,
    newItem: GenericItem
  ) => void;
}

export type TemplateStore = ReturnType<typeof createTemplateStore>;

export const createTemplateStore = (initProps?: TemplateProps) => {
  const DEFAULT: TemplateProps = {
    templates: [],
  };

  return createStore<TemplateState>()((set, get) => ({
    ...DEFAULT,
    ...initProps,
    setTemplates: (templates: Template[]) => set({ templates }),
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
        };
      }),
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
