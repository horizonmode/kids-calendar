import GalleryDialog from "@/components/dialogs/GalleryDialog";
import PeopleDialog from "@/components/dialogs/PeopleDialog";
import PhotoDialog from "@/components/dialogs/PhotoDialog";
import { ImageStoreProvider } from "@/components/providers/ImageProvider";
import ModalProvider from "@/components/providers/ModalProvider";
import PersonProvider from "@/components/providers/PersonProvider";
import { list } from "@/utils/blobStorage";
import { GetPeople } from "@/utils/cosmosHandler";

export default async function GridLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string };
}>) {
  const { calendarId } = params;
  // const initialPeopleData = await GetPeople(calendarId);
  // const initialImages = await list(calendarId);

  return (
    <PersonProvider people={[]}>
      <ImageStoreProvider images={[]}>
        <ModalProvider>
          <section className="gap-4 flex-1 flex flex-col justify-between items-stretch p-3 md:p-6">
            <PeopleDialog calendarId={calendarId} />
            <GalleryDialog calendarId={calendarId} />
            <PhotoDialog />
            {children}
          </section>
        </ModalProvider>
      </ImageStoreProvider>
    </PersonProvider>
  );
}
