"use client";
import React, {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Icon } from "@tremor/react";
import { useDroppable } from "@dnd-kit/core";
import { RiArrowLeftLine } from "@remixicon/react";
import { RiArrowDownLine } from "@remixicon/react";
import { RiInformationLine } from "@remixicon/react";
import { RiArrowLeftWideLine } from "@remixicon/react";
import { RiArrowRightWideLine } from "@remixicon/react";
import { RiArrowRightLine, RiEditFill, RiEditLine } from "@remixicon/react";

import Note from "./Note";
import PostCard from "./PostCard";
import Draggable from "./Draggable";
import DraggableTape from "./DraggableTape";
import { CalendarItem, EventItem, GenericItem } from "../types/Items";

interface ToolbarProps {
  toolbarItems: (CalendarItem | EventItem)[];
  onNext?: () => void;
  onPrev?: () => void;
  onShare: () => void;
  onToggleLock?: () => void;
  showNav: boolean;
  locked?: boolean;
  pendingChanges?: boolean;
}

const Toolbar = ({
  toolbarItems,
  onNext,
  onPrev,
  onShare,
  onToggleLock,
  showNav = true,
  locked = true,
  pendingChanges = false,
}: ToolbarProps) => {
  const [open, setOpen] = useState(true);

  const renderItem = (ti: CalendarItem | EventItem, i: number) => {
    switch (ti.type) {
      case "post-it":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-around scale-75"
          >
            <Draggable
              id={ti.id}
              key={`toolbaritem-${i}`}
              element="post-it"
              style={{
                zIndex: 200,
                position: "relative",
              }}
              data={{
                content: ti.content,
                expanded: false,
                title: "new note",
                editable: false,
                width: ti.width,
                height: ti.height,
              }}
            >
              <Note
                key={`toolbaritem-${i}`}
                content={ti.content}
                style={{
                  position: "relative",
                  zIndex: 200,
                }}
                editable={false}
                width={ti.width}
                height={ti.height}
                onUpdateContent={(val: string) => {}}
              ></Note>
            </Draggable>
          </div>
        );

      case "post-card":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-center scale-75"
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
              data={{
                content: ti.content,
                width: ti.width,
                height: ti.height,
                showLabel: ti.showLabel,
              }}
            >
              <PostCard
                content={ti.content || ""}
                style={{
                  position: "relative",
                  zIndex: 200,
                }}
                width={ti.width}
                height={ti.height}
                showLabel={ti.showLabel}
              ></PostCard>
            </Draggable>
          </div>
        );

      case "event":
        return (
          <div
            key={`toolbar-item-${i}`}
            className="flex-1 flex flex-col items-center justify-around scale-75"
          >
            <DraggableTape
              key={`toolbarItem-${i}`}
              id={ti.id}
              isStart={true}
              isEnd={false}
              eventId={ti.id}
              style={{
                zIndex: 200,
                width: "10em",
                position: "relative",
              }}
              event={ti as EventItem}
              useHandle={false}
            />
          </div>
        );
    }
  };

  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  useLayoutEffect(() => {
    const scrollVal = scrollRef.current;
    setShowRightScroll(
      scrollVal.scrollWidth - scrollVal.clientWidth - scrollVal.scrollLeft > 0
    );
  }, []);

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
    const scrollDist = scrollRef.current.scrollWidth - window.innerWidth;
    scrollRef.current.scrollBy({
      left: -scrollDist,
      behavior: "smooth",
    });
  };

  const onScrollRight = () => {
    const scrollDist = scrollRef.current.scrollWidth - window.innerWidth;
    scrollRef.current.scrollBy({
      left: scrollDist,
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

        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200"
          onClick={onShare}
        >
          <Icon size="lg" icon={RiInformationLine} />
        </div>
        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200"
          onClick={onToggleLock}
        >
          <Icon size="lg" icon={!locked ? RiEditLine : RiEditFill} />
        </div>
      </div>
      <div
        ref={scrollRef}
        className={`flex flex-row bg-white bg-opacity-90 p-auto overflow-y-hidden overflox-x-scroll rounded-tl-xl flex-1 items-stretch justify-start md:justify-around gap-12 touch-none pt-1`}
      >
        {toolbarItems.map((ti: CalendarItem | EventItem, i: number) =>
          renderItem(ti, i)
        )}
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
