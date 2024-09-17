"use server";

import { Person } from "@/types/Items";
import { UpdatePeople } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export const updatePeopleAction = async (
  calendarId: string,
  people: Person[],
  path?: string
) => {
  const updatedPeople = await UpdatePeople(calendarId, people);
  if (path) revalidatePath(path);
  return updatedPeople || [];
};
