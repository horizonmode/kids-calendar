import CalendarProvider from "@/components/providers/CalendarProvider";
import { GetDays } from "@/utils/cosmosHandler";

export default async function CalendarLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string; year: number; month: number };
}>) {
  const { calendarId, year, month } = params;
  const initialData = await GetDays(calendarId);

  return (
    <CalendarProvider
      days={initialData.days}
      events={initialData.events}
      selectedDay={new Date(year, month, 1)}
    >
      <>{children}</>
    </CalendarProvider>
  );
}
