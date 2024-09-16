"use server";

import { EventItem } from "@/types/Items";
import { UpdateEvents } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export type UpdateEventsAction = (
  calendarId: string,
  events: EventItem[],
  path?: string
) => Promise<EventItem[]>;

export const updateEventsAction: UpdateEventsAction = async (
  calendarId: string,
  events: EventItem[],
  path?: string
) => {
  const updatedPeople = await UpdateEvents(events, calendarId);
  if (path) revalidatePath(path, "layout");
  return updatedPeople || [];
};
