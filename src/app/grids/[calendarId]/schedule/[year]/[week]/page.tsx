"use client";
import React, { startTransition, useEffect, useState } from "react";

import { Days } from "@/utils/days";
import { shallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import Header from "@/components/ScheduleHeader";
import ScheduleView from "@/components/ScheduleView";
import { useScheduleContext } from "@/store/schedule";
import { useTemplateContext } from "@/store/template";
import CalendarHeader from "@/components/CalendarHeader";
import { useRoutes } from "@/components/providers/RoutesProvider";
import scheduleService from "@/utils/scheduleService";
import { updateScheduleAction } from "@/serverActions/schedules";
const { applyTemplate } = scheduleService;

const getMonthFromWeek = (week: number) => {
  return new Date(1000 * 60 * 60 * 24 * 7 * week).getMonth();
};

const SchedulePage = ({
  params,
}: {
  params: { calendarId: string; week: number; year: number };
}) => {
  const { year, week, schedules, setSchedule } = useScheduleContext();

  const [templates] = useTemplateContext((state) => [state.templates], shallow);

  const { calendar, schedule, template } = useRoutes();

  const router = useRouter();
  const { calendarId, ...p } = params;
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

  const onApplyTemplateClicked = async () => {
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (!selectedTemplate) return;

    const mergedSchedule = applyTemplate(
      selectedTemplate.schedule,
      schedules,
      week,
      year
    );

    startTransition(() => {
      setSchedule(mergedSchedule);
    });

    await updateScheduleAction(calendarId, mergedSchedule, "/grids/");
  };

  const onEditTemplateClicked = () => {
    router.push(`${template}`, { scroll: false });
  };

  const onSwitchClicked = () => {
    router.push(`${calendar}`, { scroll: false });
  };

  const tabIndex = 1;

  const onTabChange = (index: number) => {
    switch (index) {
      case 0:
        router.push(`${calendar}/${year}/${getMonthFromWeek(week)}`, {
          scroll: false,
        });
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
        calendarId={calendarId}
      />
    </>
  );
};

export default SchedulePage;
