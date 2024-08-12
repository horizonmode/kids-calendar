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
    <div className="flex gap-4 justify-start md:justify-between flex-wrap md:flex-nowrap w-full md:w-1/2">
      <div className="flex-1">
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
      </div>
      <Button className="flex-1" variant="primary" onClick={onApplyTemplate}>
        Apply
      </Button>
      <Button
        className="flex-1"
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
