"use client";
import React from "react";

import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import Templates from "@/components/Templates";
import Header from "@/components/CalendarHeader";
import { useCalendarContext } from "@/store/calendar";
import { useParams, useRouter } from "next/navigation";

const TemplatePage = () => {
  const [selectedDay] = useCalendarContext(
    (state) => [state.selectedDay],
    shallow
  );

  const { calendarId } = useParams<{ calendarId: string }>();
  const router = useRouter();

  const onSwitchClicked = async () => {
    const daysUtil = new Days();
    const week = daysUtil.getWeekNumber(selectedDay);
    router.push(
      `/grids/schedule/${calendarId}?year=${selectedDay.getFullYear()}&week=${week}`
    );
  };

  const tabIndex = 2;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(`/grids/calendar/${calendarId}`);
        break;
      case 1:
        onSwitchClicked();
        break;
      case 2:
        router.push(`/grids/template/${calendarId}`);
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
