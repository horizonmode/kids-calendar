import ModalProvider from "@/components/providers/ModalProvider";
import PersonProvider from "@/components/providers/PersonProvider";
import ScheduleProvider from "@/components/providers/ScheduleProvider";
import TemplateProvider from "@/components/providers/TemplateProvider";
import { GetPeople, GetSchedules, GetTemplates } from "@/utils/cosmosHandler";

export default async function ScheduleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string; week: number };
}>) {
  const { calendarId } = params;

  const initialPeopleData = await GetPeople(calendarId);
  const initialScheduleData = await GetSchedules(calendarId);
  const initialTemplateData = await GetTemplates(calendarId);
  return (
    <ModalProvider>
      <PersonProvider people={initialPeopleData.people}>
        <TemplateProvider templates={initialTemplateData}>
          <ScheduleProvider schedules={initialScheduleData}>
            {children}
          </ScheduleProvider>
        </TemplateProvider>
      </PersonProvider>
    </ModalProvider>
  );
}
