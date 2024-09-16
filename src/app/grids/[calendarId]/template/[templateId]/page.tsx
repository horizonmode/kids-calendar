"use client";
import React, { useEffect, useState } from "react";

import { shallow } from "zustand/shallow";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Header from "@/components/CalendarHeader";
import { RiClipboardLine } from "@remixicon/react";
import { useTemplateContext } from "@/store/template";
import TemplateView from "@/components/TemplateView";
import useWarnIfUnsavedChanges from "@/hooks/useWarnIfUnsavedChanges";
import { Button, Dialog, DialogPanel, TextInput } from "@tremor/react";
import { useRoutes } from "@/components/providers/RoutesProvider";

const TemplateEditPage = () => {
  const [templates, editTemplate, sync, fetch, pendingChanges] =
    useTemplateContext(
      (state) => [
        state.templates,
        state.editTemplate,
        state.sync,
        state.fetch,
        state.pendingChanges,
      ],
      shallow
    );

  const router = useRouter();
  const { calendar, template: templateRoute } = useRoutes();
  const { calendarId, templateId } = useParams<{
    calendarId: string;
    templateId: string;
  }>();

  const template = templates.find((t) => t.id === templateId);
  const [showModal, setShowModal] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useWarnIfUnsavedChanges(pendingChanges > 0, () => {
    setShowModal(3);
    return false;
  });

  if (!template) return null;

  const onTitleChange: React.ChangeEventHandler<HTMLInputElement> = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = e.target.value;
    editTemplate(template.id, { ...template, name });
  };

  const onSwitchClicked = () => {
    router.push(templateRoute, { scroll: false });
  };

  const onSyncClicked = () => {
    setSaving(true);
    const save = async () => {
      await sync(calendarId);
      setShowModal(1);
      setSaving(false);
    };
    save();
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
            onChange={onTitleChange}
            value={template?.name}
            placeholder="Name..."
          />
        </div>
      </div>
      <TemplateView
        templateId={templateId}
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
