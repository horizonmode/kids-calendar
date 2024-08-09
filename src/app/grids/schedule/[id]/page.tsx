"use client";
import React, { useEffect, useState } from "react";
import { useScheduleStore } from "@/store/schedule";
import { shallow } from "zustand/shallow";
import { Days } from "@/utils/days";
import { TextInput, Dialog, DialogPanel, Button } from "@tremor/react";
import { RiClipboardLine } from "@remixicon/react";
import useWarnIfUnsavedChanges from "@/hooks/useWarnIfUnsavedChanges";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import CalendarHeader from "@/components/CalendarHeader";
import Header from "@/components/ScheduleHeader";
import ScheduleView from "@/components/ScheduleView";
import { useTemplateStore } from "@/store/template";

const SchedulePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = useParams();
  const scheduleId = id as string;
  const year = parseInt(
    searchParams.get("year") || new Date().getFullYear().toString()
  );
  const week = parseInt(
    searchParams.get("week") || new Days().getWeekNumber(new Date()).toString()
  );
  const [templateId, setTemplateId] = useState("");
  const [showModal, setShowModal] = useState<Number | null>(null);
  const [saving, setSaving] = useState(false);

  const [applyTemplate, fetch, sync, pendingChanges] = useScheduleStore(
    (state) => [
      state.applyTemplate,
      state.fetch,
      state.sync,
      state.pendingChanges,
    ],
    shallow
  );

  const [templates] = useTemplateStore((state) => [state.templates], shallow);

  useEffect(() => {
    if (templates && templates.length > 0) setTemplateId(templates[0].id);
  }, [templates]);

  useEffect(() => {
    if (id) fetch(scheduleId);
  }, [id]);

  const onSyncClicked = () => {
    setSaving(true);
    const save = async () => {
      await sync(scheduleId);
      setShowModal(1);
      setSaving(false);
    };
    save();
  };
  const onNext = () => {
    let nextYear = year;
    let nextWeek = week + 1;
    const dateUtil = new Days();
    const weeksInYear = dateUtil.weeksInYear(year);
    if (nextWeek > weeksInYear) {
      nextYear = nextYear + 1;
      nextWeek = 1;
    }
    router.push(`/schedule/${id}?year=${nextYear}&week=${nextWeek}`);
  };

  const onPrev = () => {
    let prevYear = year;
    let prevWeek = week - 1;
    const dateUtil = new Days();
    if (prevWeek < 1) {
      prevYear = prevYear - 1;
      prevWeek = dateUtil.weeksInYear(prevYear);
    }
    router.push(`/schedule/${id}?year=${prevYear}&week=${prevWeek - 1}`);
  };

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const onApplyTemplateClicked = () => {
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (!selectedTemplate) return;
    applyTemplate(selectedTemplate.schedule, week, year);
  };

  const onEditTemplateClicked = () => {
    router.push(`/grids/template/${id}`);
  };

  const onSwitchClicked = () => {
    router.push(`/grids/calendar/${id}`);
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

  const tabIndex = 1;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(`/grids/calendar/${id}`);
        break;
      case 1:
        onSwitchClicked();
        break;
      case 2:
        router.push(`/grids/template/${id}`);
        break;
    }
  };

  useWarnIfUnsavedChanges(pendingChanges > 0, () => {
    setShowModal(3);
    return true;
  });

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
        onSave={onSyncClicked}
        saving={saving}
        onShare={onShare}
      />
      <Dialog
        open={showModal === 1}
        onClose={(val) => setShowModal(null)}
        static={true}
      >
        <DialogPanel>
          <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
            Calendar {id} Saved Successfully
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
            Calendar ID: {id}
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
              await fetch(scheduleId);
              setShowModal(null);
            }}
          >
            Discard
          </Button>
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default SchedulePage;
