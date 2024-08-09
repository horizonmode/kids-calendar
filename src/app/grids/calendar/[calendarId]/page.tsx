"use client";
import { useEffect } from "react";
import { useState } from "react";
import MonthView from "@/components/MonthView";
import { useCalendarStore } from "@/store/calendar";
import { shallow } from "zustand/shallow";
import Header from "@/components/CalendarHeader";
import { useRouter, useParams } from "next/navigation";
import useWarnIfUnsavedChanges from "@/hooks/useWarnIfUnsavedChanges";
import { Days } from "@/utils/days";
import { Button, Dialog, DialogPanel, TextInput } from "@tremor/react";
import { RiClipboardLine } from "@remixicon/react";

export default function Calendar() {
  const [fetch, sync, prevMonth, nextMonth, selectedDay, pendingChanges] =
    useCalendarStore(
      (state) => [
        state.fetch,
        state.sync,
        state.prevMonth,
        state.nextMonth,
        state.selectedDay,
        state.pendingChanges,
      ],
      shallow
    );

  const [showModal, setShowModal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { calendarId } = useParams();

  const onSyncClicked = () => {
    const save = async () => {
      setSaving(true);
      if (calendarId && sync) sync(calendarId as string);
      setShowModal(1);
      setSaving(false);
    };
    save();
  };

  useEffect(() => {
    if (calendarId && fetch) fetch(calendarId as string);
  }, [fetch, calendarId]);

  const onSwitchClicked = async () => {
    const daysUtil = new Days();
    const week = daysUtil.getWeekNumber(selectedDay);
    router.push(
      `/grids//schedule/${calendarId}?year=${selectedDay.getFullYear()}&week=${week}`
    );
  };

  const onShare = () => {
    setShowModal(2);
  };

  const onClipboardClick = () => {
    navigator.clipboard.writeText(window?.location?.href);
  };

  const createNew = () => {
    router.push("/");
  };

  const tabIndex = 0;

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

  useWarnIfUnsavedChanges(pendingChanges > 0, () => {
    setShowModal(3);
    return true;
  });

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
        onNext={nextMonth}
        onPrev={prevMonth}
        onSave={onSyncClicked}
        onShare={onShare}
        saving={false}
        onRevert={() => {
          console.log("revert");
        }}
      />
      <Dialog
        open={showModal === 1}
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
        open={showModal === 2}
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
        open={showModal === 3}
        onClose={(val) => setShowModal(null)}
        static={true}
      >
        <DialogPanel>
          <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            You have pending changes
          </h3>
          <Button
            className="mt-8 w-full"
            onClick={async () => {
              await onSyncClicked();
            }}
          >
            Save
          </Button>
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
