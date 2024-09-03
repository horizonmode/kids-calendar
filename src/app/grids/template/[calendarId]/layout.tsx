import ModalProvider from "@/components/ModalProvider";
import TemplateProvider from "@/components/providers/TemplateProvider";
import { GetTemplates } from "@/utils/cosmosHandler";

export default async function TemplateLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { calendarId: string };
}>) {
  const { calendarId } = params;
  const initialTemplates = await GetTemplates(calendarId);
  return (
    <ModalProvider>
      <TemplateProvider templates={initialTemplates}>
        <>{children}</>
      </TemplateProvider>
    </ModalProvider>
  );
}
