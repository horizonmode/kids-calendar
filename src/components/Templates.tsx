"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import { useRouter } from "next/navigation";
import { Card } from "@tremor/react";
import { shallow } from "zustand/shallow";
import { Button } from "@tremor/react";
import { useTemplateStore } from "@/store/template";

interface AdminProps {
  calendarId: string;
}

export default function Admin({ calendarId }: AdminProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedTempateId, setSelectedTemplateId] = useState("");

  const [templates, createTemplate, deleteTemplate, sync, fetch] =
    useTemplateStore(
      (state) => [
        state.templates,
        state.createTemplate,
        state.deleteTemplate,
        state.sync,
        state.fetch,
      ],
      shallow
    );

  const selectForDelete = (id: string) => {
    setSelectedTemplateId(id);
    setShowModal(true);
  };

  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async (calendarId: string) => {
      await fetch(calendarId);
    };
    if (calendarId) {
      fetchTemplates(calendarId);
    }
  }, [calendarId]);

  const onAddClicked = () => {
    createTemplate(calendarId);
    sync(calendarId);
  };

  const onDeleted = () => {
    deleteTemplate(selectedTempateId);
    sync(calendarId);
  };

  return (
    <>
      <div className="flex flex-col gap-5 items-start flex-1">
        {templates
          .filter((t) => !t.softDelete)
          .map((t, i) => (
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
                    router.push(`/grids/template/${calendarId}/${t.id}`)
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
