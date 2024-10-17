import React, { useRef, useState, useEffect, MutableRefObject } from "react";
import { createPortal } from "react-dom";
import { DragOverlay, useDndContext } from "@dnd-kit/core";
import Tape from "./Tape";
import Note from "./Note";
import ResizeIcon from "./ResizeIcon";
import PostCard from "./PostCard";
import Person from "./PersonCard";
import Group from "./Group";
import { Item } from "./Item";
import Divider from "./Divider";
import { GenericItem } from "@/types/Items";

interface OverlayProps {
  axis?: string;
  dragging?: boolean;
  adjustScale?: boolean;
  style?: React.CSSProperties;
  item?: GenericItem;
}

function DraggableOverlay({
  axis,
  dragging,
  adjustScale = false,
  style,
  item,
}: OverlayProps) {
  const { active } = useDndContext();
  const ref = useRef<HTMLElement>() as MutableRefObject<HTMLElement>;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.body;
    setMounted(true);
  }, []);

  const getElement = () => {
    switch (active?.data?.current?.type) {
      case "post-it":
      case "text":
        return (
          <Note
            style={{
              boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.5)",
              ...active.data.current.style,
            }}
            {...active.data.current.extra}
            highlight={false}
            dragging={true}
          />
        );
      case "post-card":
        return (
          <PostCard
            style={{ ...active.data.current.style }}
            {...active.data.current.extra}
          />
        );
      case "event":
        if (active.data.current.action === "move")
          return <Tape {...active.data.current.extra} />;
        if (active.data.current.action === "resize") return <ResizeIcon />;
      case "people":
        return <Person {...active.data.current.extra} hideName={true} />;
      case "group":
        return (
          <Group
            style={{ ...active.data.current.style }}
            disableDrop={true}
            {...active.data.current.extra}
          />
        );
      case "divider":
        return <Divider />;
      default:
        return (
          <Item
            dragOverlay={true}
            wrapperStyle={style}
            value={item?.content}
          ></Item>
        );
    }
  };

  return mounted
    ? createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={null}>
          {active ? getElement() : null}
        </DragOverlay>,
        document.body
      )
    : null;
}

export default DraggableOverlay;
