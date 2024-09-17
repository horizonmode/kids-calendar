"use client";
import React, { useEffect, useState } from "react";

import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import useModalContext from "@/store/modals";
import Header from "@/components/ScheduleHeader";
import { RiClipboardLine } from "@remixicon/react";
import ScheduleView from "@/components/ScheduleView";
import { useScheduleContext } from "@/store/schedule";
import { useTemplateContext } from "@/store/template";
import CalendarHeader from "@/components/CalendarHeader";
import PeopleDialog from "@/components/dialogs/PeopleDialog";
import { useRoutes } from "@/components/providers/RoutesProvider";
import { Button, Dialog, DialogPanel, TextInput } from "@tremor/react";

const SchedulePage = ({
  params,
}: {
  params: { calendarId: string; week: number; year: number };
}) => {
  const [applyTemplate, week, year] = useScheduleContext(
    (state) => [state.applyTemplate, state.week, state.year],
    shallow
  );

  console.log(week, year);

  const [templates] = useTemplateContext((state) => [state.templates], shallow);
  const [showModal, setShowModal] = useModalContext(
    (state) => [state.showModal, state.setShowModal],
    shallow
  );

  const { calendar, schedule, template } = useRoutes();

  const router = useRouter();
  const { calendarId, ...p } = params;
  console.log(calendarId, p);

  const [templateId, setTemplateId] = useState("");

  useEffect(() => {
    if (templates && templates.length > 0) setTemplateId(templates[0].id);
  }, [templates]);

  const onNext = () => {
    let nextYear = year;
    let nextWeek = week + 1;
    const dateUtil = new Days();
    const weeksInYear = dateUtil.weeksInYear(year);
    if (nextWeek > weeksInYear) {
      nextYear = nextYear + 1;
      nextWeek = 1;
    }
    router.push(`${schedule}/${nextYear}/${nextWeek}`, {
      scroll: true,
    });
  };

  const onPrev = () => {
    let prevYear = year;
    let prevWeek = week - 1;
    const dateUtil = new Days();
    if (prevWeek < 1) {
      prevYear = prevYear - 1;
      prevWeek = dateUtil.weeksInYear(prevYear);
    }
    router.push(`${schedule}?/${prevYear}/${prevWeek - 1}`, {
      scroll: true,
    });
  };

  const templateOptions = templates.map((t, i) => ({
    value: t.id,
    label: t.name,
  }));

  const onApplyTemplateClicked = () => {
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (!selectedTemplate) return;
    applyTemplate(selectedTemplate.schedule, week, year);
  };

  const onEditTemplateClicked = () => {
    router.push(`${template}`, { scroll: false });
  };

  const onSwitchClicked = () => {
    router.push(`${calendar}`, { scroll: false });
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

  const tabIndex = 1;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(`${calendar}`, { scroll: false });
        break;
      case 1:
        onSwitchClicked();
        break;
      case 2:
        router.push(`${template}?year=${year}&week=${week}`, { scroll: false });
        break;
    }
  };

  return (
    <>
      <CalendarHeader
        onSwitchClicked={onSwitchClicked}
        tabIndex={tabIndex}
        onTabChange={onTabChange}
        showTabs={true}
        buttonText="next"
      >
        <h1>
          Week {week}/{year}
        </h1>
      </CalendarHeader>
      <Header
        templateId={templateId}
        onTemplateChange={(t) => setTemplateId(t)}
        templateOptions={templateOptions}
        onApplyTemplate={onApplyTemplateClicked}
        onEditTemplateClicked={onEditTemplateClicked}
      />
      <ScheduleView
        week={week}
        year={year}
        onNext={onNext}
        onPrev={onPrev}
        onShare={onShare}
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
          {/* <Button
            className="mt-8 w-full"
            onClick={async () => {
              await onSyncClicked();
            }}
          >
            Save
          </Button> */}
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={async () => {
              await fetch(calendarId);
              setShowModal(null);
            }}
          >
            Discard
          </Button>
        </DialogPanel>
      </Dialog>
      <PeopleDialog calendarId={calendarId} />
    </>
  );
};

export default SchedulePage;
