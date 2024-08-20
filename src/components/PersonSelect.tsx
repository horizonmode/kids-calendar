import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { RiArrowRightLine } from "@remixicon/react";
import { RiArrowLeftLine } from "@remixicon/react";
import { RiArrowDownLine } from "@remixicon/react";
import { Icon, Button } from "@tremor/react";
import { RiSave2Line } from "@remixicon/react";
import { RiInformationLine } from "@remixicon/react";
import { RiArrowRightWideLine } from "@remixicon/react";
import { RiArrowLeftWideLine } from "@remixicon/react";
import { useDroppable } from "@dnd-kit/core";
import Person from "./Person";
import Draggable from "./Draggable";

interface PersonSelectProps {
  //   onSave: () => void;
  //   onNext: () => void;
  //   onPrev: () => void;
  //   onShare: () => void;
  //   showNav: boolean;
  //   saving: boolean;
  people: string[];
}

const PersonSelect = ({
  people,
}: //   onSave,
//   onNext,
//   onPrev,
//   onShare,
//   showNav = true,
//   saving = false,
PersonSelectProps) => {
  const [open, setOpen] = useState(true);

  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const onScroll = () => {
    let currentPosition = scrollRef.current.scrollLeft;
    setShowRightScroll(currentPosition === 0);
    setShowLeftScroll(currentPosition > 0);
  };

  const { isOver, setNodeRef } = useDroppable({
    id: "toolbar-person",
  });

  const scrollRef = useRef<HTMLDivElement>(
    null
  ) as MutableRefObject<HTMLDivElement>;
  setNodeRef(scrollRef.current);

  useEffect(() => {
    scrollRef.current.addEventListener("scroll", onScroll);
    return () => {
      scrollRef?.current?.removeEventListener("scroll", onScroll);
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
      className="overflow-y-visible w-full max-w-5xl top-1/2 -translate-y-1/2 z-50  fixed flex touch-none"
      style={{
        transition: "left .5s, top .5s",
        width: "15vh",
        height: "50vh",
        left: open ? "0" : "-15vh",
        outline: isOver ? "1px solid red" : "none",
      }}
    >
      <div
        className={`absolute -top-0 z-50 -right-12 bg-white bg-opacity-90 overflow-visible rounded-r-xl flex flex-col-reverse cursor-pointer`}
      >
        <div
          className="flex-1 flex justify-center align-middle items-center overflow-visible w-12 h-12 hover:bg-slate-200"
          onClick={() => setOpen(!open)}
        >
          <Icon
            style={{
              transform: !open ? "rotate(270deg)" : "rotate(90deg)",
              transition: "top 2s, left 2s, transform .5s",
            }}
            size="lg"
            icon={RiArrowDownLine}
          />
        </div>
      </div>
      <div
        ref={scrollRef}
        className={`flex flex-col bg-white
        bg-opacity-90 p-auto overflow-x-hidden overflow-y-scroll rounded-tl-xl flex-1 items-baseline justify-start md:justify-around gap-2 touch-none`}
      >
        {people.map((person, i) => (
          <Draggable
            key={`person-${i}`}
            element="person"
            style={{ position: "relative" }}
            id={`person-${i}`}
            data={{ name: person }}
          >
            <Person name={person} />
          </Draggable>
        ))}
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

export default PersonSelect;
