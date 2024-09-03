import React from "react";
import DropDown from "./Dropdown";
import { Button } from "@tremor/react";
import { RiArrowRightLine } from "@remixicon/react";

interface HeaderProps {
  templateId: string;
  onTemplateChange: (e: any) => void;
  templateOptions: { label: string; value: string }[];
  onApplyTemplate: () => void;
  onEditTemplateClicked: () => void;
}

const Header = ({
  templateId,
  onTemplateChange,
  templateOptions,
  onApplyTemplate,
  onEditTemplateClicked,
}: HeaderProps) => {
  return (
    <div className="flex gap-4 justify-start flex-wrap md:flex-nowrap p-6">
      <DropDown
        onChange={(e) => {
          onTemplateChange(e);
        }}
        value={templateId}
        label="Select Template"
        options={templateOptions}
        id="template"
        showDefault={false}
      />
      <Button variant="primary" onClick={onApplyTemplate}>
        Apply
      </Button>
      <Button
        icon={RiArrowRightLine}
        iconPosition="right"
        variant="secondary"
        onClick={onEditTemplateClicked}
      >
        Edit Templates
      </Button>
    </div>
  );
};

export default Header;
