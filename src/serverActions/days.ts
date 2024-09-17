"use server";

import { CalendarDay } from "@/types/Items";
import { UpdateDay, UpdateDays } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export type UpdateDaysAction = (
  calendarId: string,
  days: CalendarDay[],
  path?: string
) => Promise<CalendarDay[]>;

export type UpdateDayAction = (
  calendarId: string,
  day: CalendarDay,
  path?: string
) => Promise<CalendarDay>;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateDaysAction: UpdateDaysAction = async (
  calendarId: string,
  days: CalendarDay[],
  path?: string
) => {
  const updatedDays = await UpdateDays(days, calendarId);
  if (path) revalidatePath(path);
  return updatedDays || [];
};

export const updateDayAction: UpdateDayAction = async (
  calendarId: string,
  day: CalendarDay,
  path?: string
) => {
  const updatedDay = await UpdateDay(day, calendarId);
  if (!updatedDay) throw new Error("Day not updated");
  if (path) revalidatePath(path);
  return updatedDay;
};
