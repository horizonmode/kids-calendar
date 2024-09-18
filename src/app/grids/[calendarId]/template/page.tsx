"use client";
import React from "react";
import Templates from "@/components/Templates";
import Header from "@/components/CalendarHeader";
import { useParams, useRouter } from "next/navigation";
import { useRoutes } from "@/components/providers/RoutesProvider";

const getMonthFromWeek = (week: number) => {
  return new Date(1000 * 60 * 60 * 24 * 7 * week).getMonth();
};

const TemplatePage = ({
  searchParams,
}: {
  searchParams: { week: number; year: number };
}) => {
  const { calendarId } = useParams<{ calendarId: string }>();
  const { week, year } = searchParams;

  const router = useRouter();
  const { calendar, template } = useRoutes();

  const onSwitchClicked = async () => {
    router.push(`schedule/${year || new Date().getFullYear()}/${week || 1}`, {
      scroll: false,
    });
  };

  const tabIndex = 2;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(
          `${calendar}/${year || new Date().getFullYear()}/${
            week ? getMonthFromWeek(week) : 0
          }`,
          {
            scroll: true,
          }
        );
        break;
      case 1:
        onSwitchClicked();
        break;
      case 2:
        router.push(template, { scroll: false });
        break;
    }
  };

  return (
    <>
      <Header
        onSwitchClicked={onSwitchClicked}
        tabIndex={tabIndex}
        onTabChange={onTabChange}
        showTabs={true}
      >
        <h1>Templates</h1>
      </Header>
      <Templates calendarId={calendarId} />
    </>
  );
};
export default TemplatePage;
