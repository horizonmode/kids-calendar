"use client";
import { useState } from "react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card } from "@tremor/react";
import { shallow } from "zustand/shallow";
import { Button } from "@tremor/react";
import { useTemplateContext } from "@/store/template";
import { useRoutes } from "./providers/RoutesProvider";
import { Template } from "@/types/Items";
import { updateTemplateAction } from "@/serverActions/templates";

interface AdminProps {
  calendarId: string;
}

export default function Admin({ calendarId }: AdminProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTempateId, setSelectedTemplateId] = useState("");
  const [templates, setTemplates] = useTemplateContext(
    (state) => [state.templates, state.setTemplates],
    shallow
  );

  const params = useSearchParams();
  const year = params.get("year") || new Date().getFullYear();
  const week = params.get("week") || 1;

  const selectForDelete = (id: string) => {
    setSelectedTemplateId(id);
    setShowModal(true);
  };

  const router = useRouter();
  const { template } = useRoutes();

  const onAddClicked = async () => {
    const newTemplate: Template = {
      id: "",
      name: "New Template",
      schedule: [],
      type: "template",
    };

    const template = await updateTemplateAction(calendarId, newTemplate);
    setTemplates([...templates, template]);
  };

  const onDeleted = async () => {
    const updatedTemplate = templates.find((t) => t.id !== selectedTempateId);
    if (!updatedTemplate) return;
    updatedTemplate.action = "delete";
    await updateTemplateAction(calendarId, updatedTemplate);
    setTemplates(templates.filter((t) => t.id !== selectedTempateId));
    setSelectedTemplateId("");
  };

  return (
    <>
      <div className="flex flex-col gap-5 items-start flex-1 p-3">
        {templates.map((t, i) => (
          <Card
            decoration="left"
            key={`template-${i}`}
            className={`shadow-md w-full relative lg:w-1/2 h-20 bg-gradient-to-r flex align-middle items-center justify-start p-2 lg:p-10 rounded-md  flex-col lg:flex-row ${" from-gray-400 to-gray-50"}`}
          >
            <span className="flex-1 text-sm font-bold line-clamp-1 lg:text-lg">
              {t.name}
            </span>
            <div className="flex flex-row justify-start gap-2">
              <Icon
                type="edit"
                onClick={() =>
                  router.push(`${template}/${t.id}?year=${year}&week=${week}`)
                }
              />
              <Icon type="del" onClick={() => selectForDelete(t.id)} />
            </div>
          </Card>
        ))}
        <div className="w-full relative lg:w-1/2 flex align-middle justify-center">
          <Button variant="primary" onClick={onAddClicked}>
            Add Template
          </Button>
        </div>
      </div>
      {showModal && (
        <Modal
          happy={false}
          title="are you sure"
          okText="Yes"
          showCancel={true}
          onAccept={() => {
            onDeleted();
            setShowModal(false);
          }}
          onCancel={() => {
            setShowModal(false);
            setSelectedTemplateId("");
          }}
        >
          <div>Are you sure you want to delete this template?</div>
        </Modal>
      )}
    </>
  );
}
