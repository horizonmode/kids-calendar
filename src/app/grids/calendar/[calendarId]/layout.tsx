import CalendarProvider from "@/components/CalendarProvider";
import { GetDays, GetPeople } from "@/utils/cosmosHandler";

export default async function CalendarLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string };
}>) {
  const { calendarId } = params;
  const initialData = await GetDays(calendarId);
  const initialPeopleData = await GetPeople(calendarId);
  return (
    <CalendarProvider
      people={initialPeopleData.people}
      days={initialData.days}
      events={initialData.events}
    >
      <>{children}</>
    </CalendarProvider>
  );
}
