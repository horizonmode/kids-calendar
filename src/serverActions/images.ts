"use server";
import { deleteBlob } from "@/utils/blobStorage";
import {
  RemoveImageFromItems,
  RemoveImageFromPeople,
} from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export type DeleteImageAction = (
  calendarId: string,
  blobName: string,
  path?: string
) => void;

export const deleteImageAction: DeleteImageAction = async (
  calendarId: string,
  blobName: string,
  path?: string
) => {
  await deleteBlob(blobName);
  await RemoveImageFromItems(calendarId, blobName);
  await RemoveImageFromPeople(calendarId, blobName);
  if (path) revalidatePath(path);
};
