import CalendarProvider from "@/components/providers/CalendarProvider";
import { CalendarDay, EventItem } from "@/types/Items";
import { GetDays, UpdateDays } from "@/utils/cosmosHandler";

export default async function CalendarLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string };
}>) {
  const { calendarId } = params;
  const initialData = await GetDays(calendarId);

  const editDaysAction = async (days: CalendarDay[]) => {
    "use server";
    return await UpdateDays(days, calendarId);
  };

  const editEventsAction = async (events: EventItem[]) => {
    "use server";
    return await Promise.resolve(events);
  };

  return (
    <CalendarProvider
      days={initialData.days}
      events={initialData.events}
      editDaysAction={editDaysAction}
      editEventsAction={editEventsAction}
    >
      <>{children}</>
    </CalendarProvider>
  );
}
