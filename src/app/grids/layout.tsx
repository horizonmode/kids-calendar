export default function GridLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="gap-4 flex-1 flex flex-col justify-between items-stretch p-3 md:p-6">
      {children}
    </section>
  );
}
