"use server";

import { Schedule } from "@/types/Items";
import { UpdateSchedule, UpdateSchedules } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export type UpdateScheduleAction = (
  calendarId: string,
  schedule: Schedule,
  path?: string
) => Promise<Schedule>;

export type UpdateSchedulesAction = (
  calendarId: string,
  schedules: Schedule[],
  path?: string
) => Promise<Schedule[]>;

export const updateScheduleAction: UpdateScheduleAction = async (
  calendarId: string,
  schedule: Schedule,
  path?: string
) => {
  const updatedSchedule = await UpdateSchedule(schedule, calendarId);
  if (path) revalidatePath(path);
  return updatedSchedule;
};

export const updateSchedulesAction: UpdateSchedulesAction = async (
  calendarId: string,
  schedules: Schedule[],
  path?: string
) => {
  const updatedSchedules = await UpdateSchedules(schedules, calendarId);
  if (path) revalidatePath(path);
  return updatedSchedules;
};
