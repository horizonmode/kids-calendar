"use client";
import React from "react";
import Templates from "@/components/Templates";
import Header from "@/components/CalendarHeader";
import { useParams, useRouter } from "next/navigation";
import { useRoutes } from "@/components/providers/RoutesProvider";

const TemplatePage = () => {
  const { calendarId } = useParams<{ calendarId: string }>();
  const router = useRouter();
  const { calendar, schedule, template } = useRoutes();

  const onSwitchClicked = async () => {
    router.push(calendar, { scroll: false });
  };

  const tabIndex = 2;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(calendar, { scroll: false });
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
