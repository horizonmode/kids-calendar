"use client";
import React, { useState } from "react";

import { shallow } from "zustand/shallow";
import { useRouter, useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import Header from "@/components/CalendarHeader";
import { RiClipboardLine } from "@remixicon/react";
import { useTemplateContext } from "@/store/template";
import TemplateView from "@/components/TemplateView";
import { Button, Dialog, DialogPanel, TextInput } from "@tremor/react";
import { useRoutes } from "@/components/providers/RoutesProvider";
import { updateTemplateAction } from "@/serverActions/templates";

const TemplateEditPage = () => {
  const [templates, editTemplate] = useTemplateContext(
    (state) => [state.templates, state.editTemplate],
    shallow
  );

  const router = useRouter();
  const { template: templateRoute } = useRoutes();
  const { calendarId, templateId } = useParams<{
    calendarId: string;
    templateId: string;
  }>();

  const searchParams = useSearchParams();
  const year = searchParams.get("year") || new Date().getFullYear();
  const week = searchParams.get("week") || 1;

  const template = templates.find((t) => t.id === templateId);
  const [showModal, setShowModal] = useState<number | null>(null);

  if (!template) return null;

  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = e.target.value;
    editTemplate(template.id, { ...template, name });
  };

  const onSwitchClicked = () => {
    router.push(`${templateRoute}?year=${year}&week=${week}`, {
      scroll: true,
    });
  };

  const onShare = () => {
    setShowModal(2);
  };

  const onClipboardClick = () => {
    navigator.clipboard.writeText(window?.location?.href);
  };

  const createNew = () => {
    router.push("/", { scroll: false });
  };

  const saveTemplate = async () => {
    await updateTemplateAction(calendarId, template, "/grids/");
  };

  return (
    <>
      <Header
        onSwitchClicked={onSwitchClicked}
        buttonText={"Back to List"}
        showTabs={false}
        onTabChange={function (index: number): void {
          throw new Error("Function not implemented.");
        }}
        tabIndex={0}
      >
        <h1>Schedule Template</h1>
      </Header>
      <div className="max-w-sm space-y-8">
        <div className="flex">
          <TextInput
            onBlur={async () => await saveTemplate()}
            onChange={onTitleChange}
            value={template?.name}
            placeholder="Name..."
          />
        </div>
      </div>
      <TemplateView
        templateId={templateId}
        calendarId={calendarId}
        onShare={onShare}
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
    </>
  );
};

export default TemplateEditPage;
