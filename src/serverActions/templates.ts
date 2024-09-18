"use server";

import { Template } from "@/types/Items";
import { UpdateTemplate } from "@/utils/cosmosHandler";
import { revalidatePath } from "next/cache";

export type UpdateTemplateAction = (
  calendarId: string,
  template: Template,
  path?: string
) => Promise<Template>;

export const updateTemplateAction: UpdateTemplateAction = async (
  calendarId: string,
  template: Template,
  path?: string
) => {
  console.log("UpdateTemplateAction", calendarId, template, path);
  const updatedTemplate = await UpdateTemplate(template, calendarId);
  if (path) revalidatePath(path);
  return updatedTemplate as Template;
};
