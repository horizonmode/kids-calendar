"use client";
import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import Note from "./Note";
import Text from "./Text";
import PostCard from "./PostCard";
import { RiArrowRightLine } from "@remixicon/react";
import { RiArrowLeftLine } from "@remixicon/react";
import { RiArrowDownLine } from "@remixicon/react";
import { Icon, Button } from "@tremor/react";
import { RiSave2Line } from "@remixicon/react";
import { RiInformationLine } from "@remixicon/react";
import { RiArrowRightWideLine } from "@remixicon/react";
import { RiArrowLeftWideLine } from "@remixicon/react";
import { useDroppable } from "@dnd-kit/core";
import Draggable from "./Draggable";
import { GenericItem, EventItem } from "../types/Items";
import DraggableTape from "./DraggableTape";

interface ToolbarProps {
  toolbarItems: (GenericItem | EventItem)[];
  onSave: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onShare: () => void;
  showNav: boolean;
  saving: boolean;
}

const Toolbar = ({
  toolbarItems,
  onSave,
  onNext,
  onPrev,
  onShare,
  showNav = true,
  saving = false,
}: ToolbarProps) => {
  const [open, setOpen] = useState(true);

  const renderItem = (ti: GenericItem, i: number) => {
    switch (ti.type) {
      case "post-it":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-flex-start"
          >
            <Draggable
              id={ti.id}
              key={`toolbaritem-${i}`}
              element="post-it"
              style={{
                zIndex: 200,
                width: "10em",
                position: "relative",
              }}
              data={{ content: ti.content }}
            >
              <Note
                key={`toolbaritem-${i}`}
                content={ti.content}
                style={{
                  position: "relative",
                  zIndex: 200,
                }}
                editable={false}
              ></Note>
            </Draggable>
          </div>
        );

      case "post-card":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-flex-start"
          >
            <Draggable
              id={ti.id}
              key={`toolbaritem-${i}`}
              element="post-card"
              style={{
                zIndex: 200,
                width: "10em",
                position: "relative",
              }}
              data={{ content: ti.content }}
            >
              <PostCard
                id={ti.id}
                content={ti.content}
                style={{
                  position: "relative",
                  zIndex: 200,
                }}
              ></PostCard>
            </Draggable>
          </div>
        );

      case "text":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-around"
          >
            <Draggable
              id={ti.id}
              key={`toolbaritem-${i}`}
              element="text"
              style={{
                zIndex: 200,
                width: "10em",
                position: "relative",
              }}
              data={{ content: ti.content }}
            >
              <Text
                key={`toolbaritem-${i}`}
                content={ti.content}
                style={{
                  position: "relative",
                  zIndex: 200,
                }}
              ></Text>
            </Draggable>
          </div>
        );

      case "event":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-around"
          >
            <DraggableTape
              key={`toolbarItem-${i}`}
              id={ti.id}
              isStart={true}
              isEnd={false}
              eventId={ti.id}
              label={"new event"}
              style={{
                zIndex: 200,
                width: "10em",
                position: "relative",
              }}
              color={ti.color}
              editable={false}
            />
          </div>
        );
    }
  };

  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const onScroll = () => {
    let currentPosition = scrollRef.current.scrollLeft;
    setShowRightScroll(currentPosition === 0);
    setShowLeftScroll(currentPosition > 0);
  };

  const { isOver, setNodeRef } = useDroppable({
    id: "toolbar",
  });

  const scrollRef = useRef<HTMLDivElement>(
    null
  ) as MutableRefObject<HTMLDivElement>;
  setNodeRef(scrollRef.current);

  useEffect(() => {
    const scrollVal = scrollRef.current;
    scrollVal.addEventListener("scroll", onScroll);
    return () => {
      scrollVal.removeEventListener("scroll", onScroll);
    };
  }, []);

  const onScrollLeft = () => {
    const pageWidth = window.innerWidth;
    scrollRef.current.scrollBy({
      left: -pageWidth,
      behavior: "smooth",
    });
  };

  const onScrollRight = () => {
    const pageWidth = window.innerWidth;
    scrollRef.current.scrollBy({
      left: pageWidth,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="overflow-x-visible w-full max-w-5xl left-1/2 -translate-x-1/2 z-50  fixed flex touch-none"
      style={{
        transition: "bottom .5s, top .5s",
        height: "15vh",
        bottom: open ? "0" : "-15vh",
        outline: isOver ? "1px solid red" : "none",
      }}
    >
      <div
        className={`absolute -right-0 z-50 -top-12 bg-white bg-opacity-90 overflow-visible rounded-t-xl flex flex-row-reverse cursor-pointer`}
      >
        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200"
          onClick={() => setOpen(!open)}
        >
          <Icon
            style={{
              transform: !open ? "rotate(180deg)" : "none",
              transition: "top 2s, left 2s, transform .5s",
            }}
            size="lg"
            icon={RiArrowDownLine}
          />
        </div>
        {showNav && (
          <div
            className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12  hover:bg-slate-200"
            onClick={onNext}
          >
            <Icon size="lg" icon={RiArrowRightLine} />
          </div>
        )}
        {showNav && (
          <div
            className="flex-1 overflow-visible w-12 h-12 flex justify-center align-middle items-center  hover:bg-slate-200"
            onClick={onPrev}
          >
            <Icon size="lg" icon={RiArrowLeftLine} />
          </div>
        )}
        <Button
          className=" opacity-100 pl-5 pr-5"
          variant="light"
          icon={RiSave2Line}
          onClick={onSave}
          loading={saving}
        >
          Save
        </Button>
        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200"
          onClick={onShare}
        >
          <Icon size="lg" icon={RiInformationLine} />
        </div>
      </div>
      <div
        ref={scrollRef}
        className={`flex flex-row bg-white bg-opacity-90 p-auto overflow-y-hidden overflox-x-scroll rounded-tl-xl flex-1 items-stretch justify-start md:justify-around gap-12 touch-none pt-1`}
      >
        {toolbarItems.map((ti: GenericItem, i: number) => renderItem(ti, i))}
        {showLeftScroll && (
          <div
            className="md:hidden absolute left-0 bottom-0 flex-1 flex justify-center items-center overflow-visible w-12 h-12  hover:bg-slate-200"
            onClick={onScrollLeft}
            style={{ zIndex: 250 }}
          >
            <Icon size="lg" icon={RiArrowLeftWideLine} />
          </div>
        )}
        {showRightScroll && (
          <div
            className="absolute md:hidden z-50 right-0 bottom-0 flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12  hover:bg-slate-200"
            onClick={onScrollRight}
            style={{ zIndex: 250 }}
          >
            <Icon size="lg" icon={RiArrowRightWideLine} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;
