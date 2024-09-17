"use server";

import { EventItem } from "@/types/Items";
import { UpdateEvents } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type UpdateEventsAction = (
  calendarId: string,
  events: EventItem[],
  path?: string
) => Promise<EventItem[]>;

export type UpdateEventAction = (
  calendarId: string,
  event: EventItem,
  path?: string
) => Promise<EventItem>;

export const updateEventsAction: UpdateEventsAction = async (
  calendarId: string,
  events: EventItem[],
  path?: string
) => {
  const updatedEvents = await UpdateEvents(events, calendarId);
  if (path) revalidatePath(path);
  return updatedEvents || [];
};

export const updateEventAction: UpdateEventAction = async (
  calendarId: string,
  event: EventItem,
  path?: string
) => {
  const updatedEvents = await UpdateEvents([event], calendarId);
  if (path) revalidatePath(path);
  return updatedEvents[0];
};
