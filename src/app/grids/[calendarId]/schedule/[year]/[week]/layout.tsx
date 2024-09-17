import ScheduleProvider from "@/components/providers/ScheduleProvider";
import TemplateProvider from "@/components/providers/TemplateProvider";
import { GetSchedules, GetTemplates } from "@/utils/cosmosHandler";

export default async function ScheduleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string; week: number; year: number };
}>) {
  const { calendarId, week, year } = params;

  const initialScheduleData = await GetSchedules(calendarId);
  const initialTemplateData = await GetTemplates(calendarId);

  return (
    <TemplateProvider templates={initialTemplateData}>
      <ScheduleProvider schedules={initialScheduleData} year={year} week={week}>
        {children}
      </ScheduleProvider>
    </TemplateProvider>
  );
}
