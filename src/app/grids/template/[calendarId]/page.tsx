"use client";
import React from "react";
import Templates from "@/components/Templates";
import Header from "@/components/CalendarHeader";
import { useParams, useRouter } from "next/navigation";

const TemplatePage = () => {
  const { calendarId } = useParams<{ calendarId: string }>();
  const router = useRouter();

  const onSwitchClicked = async () => {
    router.push(`/grids/schedule/${calendarId}`, { scroll: false });
  };

  const tabIndex = 2;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(`/grids/calendar/${calendarId}`, { scroll: false });
        break;
      case 1:
        onSwitchClicked();
        break;
      case 2:
        router.push(`/grids/template/${calendarId}`, { scroll: false });
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
