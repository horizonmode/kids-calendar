"use client";
import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import useModalContext from "@/store/modals";
import MonthView from "@/components/MonthView";
import Header from "@/components/CalendarHeader";
import { RiClipboardLine } from "@remixicon/react";
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

  const [showModal, setShowModal] = useModalContext(
    (state) => [state.showModal, state.setShowModal],
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

  const onShare = () => {
    setShowModal("share");
  };

  const onClipboardClick = () => {
    navigator.clipboard.writeText(window?.location?.href);
  };

  const createNew = () => {
    router.push("/", { scroll: false });
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
        <h1 className="text-black">
          {selectedDay.toLocaleString("default", { month: "long" })}
        </h1>
        <h1 className="text-black font-extrabold">
          {selectedDay.getFullYear()}
        </h1>
      </Header>
      <MonthView
        onNext={onNextMonth}
        onPrev={onPrevMonth}
        onShare={onShare}
        onRevert={() => {
          console.log("revert");
        }}
        calendarId={calendarId}
      />
      <Dialog
        open={showModal === "saved"}
        onClose={(val) => setShowModal(null)}
        static={true}
      >
        <DialogPanel>
          <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Calendar {calendarId} Saved Successfully
          </h3>
          <p className="mt-2 leading-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            Your calendar was saved successfully.
          </p>
          <Button className="mt-8 w-full" onClick={() => setShowModal(null)}>
            Ok
          </Button>
        </DialogPanel>
      </Dialog>
      <Dialog
        open={showModal === "share"}
        onClose={(val) => setShowModal(null)}
        static={true}
      >
        <DialogPanel>
          <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Calendar ID: {calendarId}
          </h3>
          <div className="flex flex-row gap-5 mt-3">
            <TextInput
              value={global.window === undefined ? "" : window.location.href}
            />
            <Button
              className="opacity-100 pl-5 pr-5"
              variant="primary"
              icon={RiClipboardLine}
              onClick={onClipboardClick}
            ></Button>
          </div>
          <Button className="mt-8 w-full" onClick={() => setShowModal(null)}>
            Ok
          </Button>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => createNew()}
          >
            Create Blank Calendar
          </Button>
        </DialogPanel>
      </Dialog>
      <Dialog
        open={showModal === "pending"}
        onClose={(val) => setShowModal(null)}
        static={true}
      >
        <DialogPanel>
          <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            You have pending changes
          </h3>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={async () => {
              calendarId && (await fetch(calendarId as string));
              setShowModal(null);
            }}
          >
            Discard
          </Button>
        </DialogPanel>
      </Dialog>
    </>
  );
}
