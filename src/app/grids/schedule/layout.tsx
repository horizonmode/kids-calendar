import CalendarProvider from "@/components/CalendarProvider";
import ModalProvider from "@/components/ModalProvider";
import PersonProvider from "@/components/PersonProvider";
import { GetDays, GetPeople } from "@/utils/cosmosHandler";

export default async function CalendarLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string };
}>) {
  const { calendarId } = params;
  const initialPeopleData = await GetPeople(calendarId);
  return (
    <ModalProvider>
      <PersonProvider
        people={initialPeopleData.people}
        id={initialPeopleData.id}
      >
        <>{children}</>
      </PersonProvider>
    </ModalProvider>
  );
}
