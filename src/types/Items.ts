export type Section = "morning" | "afternoon" | "evening";

export interface ScheduleItem {
  day: number;
  morning: GenericItem[];
  afternoon: GenericItem[];
  evening: GenericItem[];
}

export interface Template {
  id: string;
  name: string;
  type: string;
  schedule: ScheduleItem[];
  softDelete?: boolean;
}

export interface Schedule {
  year: number;
  week: number;
  type: string;
  schedule: ScheduleItem[];
  softDelete?: boolean;
}

export interface GenericItem {
  id: string;
  color?: string;
  type: string;
  content: string | undefined;
  x?: number;
  y?: number;
  file?: string | null;
  order: number;
}

export interface EventItem {
  id: string;
  color?: string;
  type: string;
  content: string | undefined;
  x?: number;
  y?: number;
  file?: string;
  order: number;
  softDelete?: boolean;
  day: number;
  month: number;
  year: number;
  days: number;
  calendarId?: string;
}
