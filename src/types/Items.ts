export type ItemType = "event" | "note" | "post-it" | "people";

export type GalleryImage = {
  id: number;
  url: string;
};

export type ScheduleItem = {
  day: number;
  morning: ScheduleSection;
  afternoon: ScheduleSection;
  evening: ScheduleSection;
};

export type ScheduleSection = {
  status: SaveStatus;
  items: CalendarItem[];
};

export type Template = ActionStatus & {
  name: string;
  type: string;
  schedule: ScheduleItem[];
  id: string;
};

export type Schedule = ActionStatus & {
  year: number;
  week: number;
  type: string;
  schedule: ScheduleItem[];
};

export type Person = {
  id: number;
  name: string;
  photo: GalleryImage | null;
};

export type ActionStatus = {
  status?: SaveStatus;
  action?: Action;
};

export type GenericItem = {
  id: string;
  color: string;
  content: string;
  x: number;
  y: number;
  order: number;
  people: number[];
  type: "event" | "post-it" | "post-card";
};

export type PostItItem = GenericItem & {
  type: "post-it";
  width: number;
  height: number;
};

export type PostCardItem = GenericItem & {
  type: "post-card";
  image: GalleryImage | null;
};

export type EventItem = GenericItem &
  ActionStatus & {
    type: "event";
    day: number;
    month: number;
    year: number;
    days: number;
  };

export type CalendarItem = PostItItem | PostCardItem;

export type SaveStatus = "pending" | "saved" | "error";

export type Action = "update" | "delete" | "move";

export type Section = "morning" | "afternoon" | "evening";

export type CalendarDay = ActionStatus & {
  day: number;
  month: number;
  year: number;
  type: "day" | "week";
  items: CalendarItem[];
};

export type People = ActionStatus & {
  people: Person[];
};

export type CosmosItem<T> = T & {
  calendarId: string;
  id: string;
  type: "day" | "event" | "schedule" | "template" | "people";
};
