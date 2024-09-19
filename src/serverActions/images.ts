"use server";
import { deleteBlob } from "@/utils/blobStorage";

export type DeleteImageAction = (blobName: string) => void;

export const deleteImageAction: DeleteImageAction = async (
  blobName: string
) => {
  await deleteBlob(blobName);
};
