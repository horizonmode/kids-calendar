import {
  CalendarItem,
  GenericItem,
  PostCardItem,
  PostItItem,
} from "@/types/Items";
import Draggable from "@/components/Draggable";
import Editable from "@/components/Editable";
import PersonAssignment from "@/components/PersonAssignment";
import PostCard from "@/components/PostCard";
import { CSSProperties } from "react";
import Note from "@/components/Note";
import { Resizable } from "re-resizable";

const getStyle: (d: GenericItem) => CSSProperties = (d) => ({
  position: "absolute",
  zIndex: `${d.order + 2 * 10}`,
  transform: d.x === 0 && d.y === 0 ? "translate(-50%,-50%)" : "none",
});

export const renderNote = (
  item: PostItItem,
  editable: boolean,
  onItemUpdate: (item: Partial<PostItItem>) => void,
  onItemDelete: (item: CalendarItem) => void,
  onItemSelect: (item: CalendarItem) => void,
  onItemDeselect: (item: CalendarItem) => void,
  showPeople: boolean,
  disablePeople: boolean,
  locked: boolean,
  key: string
) => (
  <Draggable
    id={item.id}
    key={key}
    left={`${item.x || 50}%`}
    top={`${item.y || 50}%`}
    element="post-it"
    style={getStyle(item)}
    data={{
      content: item.content,
      color: item.color,
      width: item.width,
      height: item.height,
    }}
    disabled={editable}
    handle={true}
  >
    <Editable
      targetComponentId={item.id}
      onDelete={() => onItemDelete(item)}
      color={item.color || "#0096FF"}
      onChangeColor={(color: string) => {
        onItemUpdate({ color });
      }}
      onSelect={(selected) => {
        if (selected) onItemSelect(item);
        else {
          onItemDeselect(item);
        }
      }}
      editable={editable}
      position="right"
      className={`${locked ? "hidden" : ""}`}
    >
      <Resizable
        enable={
          !editable ? false : { right: true, bottom: true, bottomRight: true }
        }
        onResize={(_, __, ref) => {
          onItemUpdate({ width: ref.offsetWidth, height: ref.offsetHeight });
        }}
        defaultSize={{ width: item.width, height: item.height }}
      >
        <Note
          editable={editable}
          content={item.content}
          onUpdateContent={(content: string) => {
            onItemUpdate({ content });
          }}
          color={item.color}
          width={item.width}
          height={item.height}
          onClick={() => onItemSelect(item)}
        ></Note>
      </Resizable>
    </Editable>
    {showPeople && (
      <PersonAssignment
        id={item.id}
        peopleIds={item.people || []}
        disabled={disablePeople}
        style={{ marginTop: "-5px" }}
      />
    )}
  </Draggable>
);

export const renderPostCard = (
  item: PostCardItem,
  editable: boolean,
  onItemUpdate: (item: Partial<PostCardItem>) => void,
  onItemDelete: (item: CalendarItem) => void,
  onItemSelect: (item: CalendarItem) => void,
  onItemDeselect: (item: CalendarItem) => void,
  showPeople: boolean,
  disablePeople: boolean,
  locked: boolean,
  onAddImageClicked: () => void,
  onImageClicked: () => void,
  key: string
) => {
  return (
    <Draggable
      id={item.id}
      key={key}
      left={`${item.x || 50}%`}
      top={`${item.y || 50}%`}
      style={getStyle(item)}
      element="post-card"
      data={{
        content: item.content,
        fileUrl: item.image?.url,
        width: item.width,
        height: item.height,
        showLabel: item.showLabel,
      }}
      disabled={editable}
    >
      <Editable
        targetComponentId={item.id}
        onDelete={() => onItemDelete(item)}
        color={item.color || "#0096FF"}
        onChangeColor={(color: string) => {
          onItemUpdate({ color });
        }}
        onSelect={async (selected) => {
          if (selected) onItemSelect(item);
          else await onItemDeselect(item);
        }}
        editable={editable}
        className={`${locked ? "hidden" : ""}`}
        position="right"
        actions={[
          {
            iconName: item.showLabel ? "Text" : "EyeClosed",
            onClick: () => {
              onItemUpdate({ showLabel: !item.showLabel });
            },
          },
        ]}
      >
        <Resizable
          enable={
            !editable ? false : { right: true, bottom: true, bottomRight: true }
          }
          onResize={(_, __, ref) => {
            onItemUpdate({ width: ref.offsetWidth, height: ref.offsetHeight });
          }}
          defaultSize={{ width: item.width, height: item.height }}
        >
          <PostCard
            content={item.content || ""}
            editable={editable}
            onUpdateContent={(content: string) => {
              onItemUpdate({ content });
            }}
            fileUrl={item.image?.url}
            color={item.color}
            onAddImageClicked={onAddImageClicked}
            onImageClicked={onImageClicked}
            onClick={() => onItemSelect(item)}
            width={item.width}
            height={item.height}
            showLabel={item.showLabel}
          ></PostCard>
        </Resizable>
      </Editable>
      {showPeople && (
        <PersonAssignment
          id={item.id}
          peopleIds={item.people || []}
          disabled={disablePeople}
          style={{ marginTop: "-5px" }}
        />
      )}
    </Draggable>
  );
};
