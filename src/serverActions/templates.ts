"use server";

import { Template } from "@/types/Items";
import { UpdateTemplate } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export type UpdateTemplateAction = (
  calendarId: string,
  template: Template,
  path?: string
) => Promise<Template>;

export const UpdateTemplateAction: UpdateTemplateAction = async (
  calendarId: string,
  template: Template,
  path?: string
) => {
  const updatedTemplate = await UpdateTemplate(template, calendarId);
  if (path) revalidatePath(path);
  return updatedTemplate;
};
