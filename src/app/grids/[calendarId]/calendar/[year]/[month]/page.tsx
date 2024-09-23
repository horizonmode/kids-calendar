"use client";
import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import useModalContext from "@/store/modals";
import MonthView from "@/components/MonthView";
import Header from "@/components/CalendarHeader";
import {
  RiArrowLeftCircleLine,
  RiArrowRightCircleLine,
  RiClipboardLine,
} from "@remixicon/react";
import { useCalendarContext } from "@/store/calendar";
import { useRouter } from "next/navigation";
import { Button, Dialog, DialogPanel, TextInput } from "@tremor/react";
import { useRoutes } from "@/components/providers/RoutesProvider";

export default function CalendarPage({
  params,
}: Readonly<{
  params: { calendarId: string; year: string; month: string };
}>) {
  const router = useRouter();
  const { calendarId, year, month } = params;

  const [selectedDay] = useCalendarContext(
    (state) => [state.selectedDay],
    shallow
  );

  const [activeModals, setShowActiveModals] = useModalContext(
    (state) => [state.activeModals, state.setActiveModals],
    shallow
  );

  const yearInt = parseInt(year);
  const monthInt = parseInt(month);

  const onNextMonth = () => {
    const nextYear = monthInt === 11 ? yearInt + 1 : yearInt;
    const nextMonth = monthInt === 11 ? 0 : monthInt + 1;
    router.push(`/grids/${calendarId}/calendar/${nextYear}/${nextMonth}`, {
      scroll: true,
    });
  };

  const onPrevMonth = () => {
    const prevYear = monthInt === 0 ? yearInt - 1 : year;
    const prevMonth = monthInt === 0 ? 11 : monthInt - 1;
    router.push(`/grids/${calendarId}/calendar/${prevYear}/${prevMonth}`, {
      scroll: true,
    });
  };

  const { calendar, template, schedule } = useRoutes();

  const onSwitchClicked = async () => {
    const daysUtil = new Days();
    const week = daysUtil.getWeekNumber(selectedDay);
    router.push(`${schedule}/${selectedDay.getFullYear()}/${week}`, {
      scroll: false,
    });
  };

  const tabIndex = 0;

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
        onTabChange={onTabChange}
        tabIndex={tabIndex}
        buttonText="next"
        showTabs={true}
      >
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-col gap-1">
            <RiArrowRightCircleLine
              onClick={() => onNextMonth()}
              className="hover:text-blue-600 cursor-pointer"
            />
            <RiArrowLeftCircleLine
              onClick={() => onPrevMonth()}
              className="hover:text-blue-600 cursor-pointer"
            />
          </div>
          <h1 className="text-black">
            {selectedDay.toLocaleString("default", { month: "long" })}
          </h1>
          <h1 className="text-black font-extrabold">
            {selectedDay.getFullYear()}
          </h1>
        </div>
      </Header>
      <MonthView
        onNext={onNextMonth}
        onPrev={onPrevMonth}
        onRevert={() => {
          console.log("revert");
        }}
        calendarId={calendarId}
      />
    </>
  );
}
