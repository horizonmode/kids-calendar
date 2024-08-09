import React, { ReactNode } from "react";
import { Button } from "@tremor/react";
import { RiArrowRightLine } from "@remixicon/react";
import { Tab, TabGroup, TabList } from "@tremor/react";
import Image from "next/image";

interface HeaderProps {
  onSwitchClicked: () => void;
  children: ReactNode;
  buttonText?: string;
  onTabChange: (index: number) => void;
  tabIndex: number;
  showTabs: boolean;
}

const Header = ({
  onSwitchClicked,
  children,
  buttonText,
  onTabChange,
  tabIndex,
  showTabs = true,
}: HeaderProps) => {
  return (
    <div className="flex gap-4 items-center justify-between">
      <div className="flex flex-row gap-4 flex-1">{children}</div>
      <div className="invisible md:visible flex-1 flex flex-row items-center justify-center">
        <Image
          src="/static/logo.png"
          alt="Logo"
          width="0"
          height="0"
          sizes="100vw"
          className="w-52 md:w-64 h-auto p-5"
        />
      </div>
      <div className="flex-1">
        {showTabs ? (
          <>
            <TabGroup
              className="flex-1 flex flex-row justify-end"
              index={tabIndex}
              onIndexChange={(index) => onTabChange(index)}
            >
              <TabList
                variant="solid"
                defaultValue="1"
                className=" flex-col items-baseline md:items-center md:flex-row p-1 md:p-5"
                style={{
                  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                }}
              >
                <Tab value="1">Month View</Tab>
                <Tab value="2">Week View</Tab>
                <Tab value="3">Templates</Tab>
              </TabList>
            </TabGroup>
          </>
        ) : (
          <div className="flex flex-row justify-end">
            <Button
              variant="primary"
              onClick={onSwitchClicked}
              icon={RiArrowRightLine}
              iconPosition="right"
            >
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
