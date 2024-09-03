import CalendarProvider from "@/components/providers/CalendarProvider";
import ModalProvider from "@/components/providers/ModalProvider";
import PersonProvider from "@/components/providers/PersonProvider";
import { GetDays, GetPeople } from "@/utils/cosmosHandler";
import { ImageStoreProvider } from "@/components/providers/ImageProvider";
import { list } from "@/utils/blobStorage";

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
  const initialImages = await list(calendarId);
  return (
    <ModalProvider>
      <ImageStoreProvider images={initialImages}>
        <PersonProvider
          people={initialPeopleData.people}
          id={initialPeopleData.id}
        >
          <CalendarProvider days={initialData.days} events={initialData.events}>
            <>{children}</>
          </CalendarProvider>
        </PersonProvider>
      </ImageStoreProvider>
    </ModalProvider>
  );
}
