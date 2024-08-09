import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { Delta } from "@/components/Delta";
import { GenericItem, ScheduleItem, Section, Template } from "@/types/Items";

const initialTemplates: Template[] = [
  {
    id: "1",
    name: "school-1",
    type: "template",
    schedule: [
      {
        day: 1,
        morning: [
          {
            id: "1",
            type: "post-it",
            content: "example content1",
            x: 0,
            y: 0,
            order: 0,
          },
        ],
        afternoon: [],
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
    content: "example content1",
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
  syncItem: (updatedItem: any, calendarId: string) => Promise<any>;
  deleteItem: (updatedItem: any, calendarId: string) => Promise<any>;
  fetch: (calendarId: string) => Promise<void>;
  sync: (calendarId: string) => Promise<void>;
}

const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: initialTemplates,
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
          const sectionKey = section as keyof ScheduleItem;
          const newSection = newTemplate[dayIndex][sectionKey] as GenericItem[];
          const templateItem = newTemplate[dayIndex];
          if (sectionKey === "morning") {
            templateItem.morning = [
              ...newSection.slice(0, sectionIndex),
              ...newSection.slice(sectionIndex + 1),
            ];
          }
          if (sectionKey === "afternoon") {
            templateItem.afternoon = [
              ...newSection.slice(0, sectionIndex),
              ...newSection.slice(sectionIndex + 1),
            ];
          }
          if (sectionKey === "evening") {
            templateItem.evening = [
              ...newSection.slice(0, sectionIndex),
              ...newSection.slice(sectionIndex + 1),
            ];
          }

          reOrderAll(newTemplate[dayIndex][sectionKey] as GenericItem[]);
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
          const sectionKey = section as keyof ScheduleItem;
          const sectionItems = newTemplate[dayIndex][
            sectionKey
          ] as GenericItem[];
          sectionItems[sectionIndex] = newItem;
          reOrderAll(newTemplate[dayIndex][sectionKey] as GenericItem[]);

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
              schedule: [
                { day: targetDay + 1, morning: [], afternoon: [], evening: [] },
              ],
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
            const sectionKey = section as keyof ScheduleItem;
            const sectionItems = templateItem.schedule[dayIndex][
              sectionKey
            ] as GenericItem[];
            item = sectionItems[sectionIndex];
            const sourceDay = templateItem.schedule[dayIndex];
            (sourceDay[sectionKey] as GenericItem[]).splice(sectionIndex, 1);
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
              morning: [],
              afternoon: [],
              evening: [],
            };
            templateItem.schedule.push(targetDayObj);
          }
          const targetSectionKey = targetSection as keyof ScheduleItem;
          (targetDayObj[targetSectionKey] as GenericItem[]).push(item);
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
          // newTemplates = [
          //   ...newTemplates.slice(0, templateIndex),
          //   ...newTemplates.slice(templateIndex + 1),
          // ];
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
          reOrderLayers(
            newTemplate[dayIndex][sectionKey] as GenericItem[],
            itemId
          );
          return { templates: newTemplates };
        }),
      syncItem: async (updatedItem: Template, calendarId: string) => {
        return await fetch(`/api/update/${calendarId}`, {
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
    }),
    {
      name: "template-storage",
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
          console.log("setting", newValue);
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

export { useTemplateStore };
