export type Section = "morning" | "afternoon" | "evening";
export type ItemType =
  | "event"
  | "note"
  | "task"
  | "people"
  | "template"
  | "schedule";

export interface GalleryImage {
  id: number;
  url: string;
}

export type ScheduleItem = {
  day: number;
  morning: ScheduleSection;
  afternoon: ScheduleSection;
  evening: ScheduleSection;
  status?: SaveStatus;
};

export type ScheduleSection = {
  status: SaveStatus;
  items: GenericItem[];
};

export interface Template {
  name: string;
  type: string;
  schedule: ScheduleItem[];
  softDelete?: boolean;
  id: string;
}

export type Schedule = {
  year: number;
  week: number;
  type: string;
  schedule: ScheduleItem[];
  softDelete?: boolean;
};

export interface Person {
  id: number;
  name: string;
  photo: GalleryImage | null;
  softDelete?: boolean;
}

export type GenericItem = {
  id: string;
  color: string;
  type: string;
  content: string;
  x: number;
  y: number;
  order: number;
  editable?: boolean;
  people?: number[];
  softDelete?: boolean;
};

export type PostCardItem = GenericItem & {
  image: GalleryImage | null;
};

export type EventItem = GenericItem & {
  day: number;
  month: number;
  year: number;
  days: number;
  dirty?: boolean;
  status?: SaveStatus;
};

export type SaveStatus = "pending" | "saved" | "error";

export type CalendarDay = {
  day: number;
  month: number;
  year: number;
  type: "day" | "week";
  items: GenericItem[];
  softDelete?: boolean;
  dirty?: boolean;
  status?: SaveStatus;
};

export interface People {
  people: Person[];
}

export type CosmosItem<T> = T & {
  calendarId: string;
  id: string;
  type: "day" | "event" | "schedule" | "template" | "people";
};
