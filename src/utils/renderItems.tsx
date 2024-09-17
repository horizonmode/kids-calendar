import { GenericItem, PostCardItem } from "@/types/Items";
import Draggable from "@/components/Draggable";
import Editable from "@/components/Editable";
import PersonAssignment from "@/components/PersonAssignment";
import PostCard from "@/components/PostCard";
import { CSSProperties } from "react";
import Note from "@/components/Note";
import { on } from "events";

const getStyle: (d: GenericItem) => CSSProperties = (d) => ({
  position: "absolute",
  zIndex: `${d.order + 2 * 10}`,
  transform: d.x === 0 && d.y === 0 ? "translate(-50%,-50%)" : "none",
});

export const renderNote = (
  item: GenericItem,
  editable: boolean,
  onItemUpdate: (item: Partial<GenericItem>) => void,
  onItemDelete: (item: GenericItem) => void,
  onItemSelect: (item: GenericItem) => void,
  onItemDeselect: (item: GenericItem) => void,
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
    data={{ content: item.content, color: item.color }}
    disabled={editable}
  >
    <Editable
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
      <Note
        editable={editable}
        content={item.content}
        onUpdateContent={(content: string) => {
          onItemUpdate({ content });
        }}
        color={item.color}
      />
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
  onItemUpdate: (item: Partial<GenericItem>) => void,
  onItemDelete: (item: GenericItem) => void,
  onItemSelect: (item: GenericItem) => void,
  onItemDeselect: (item: GenericItem) => void,
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
      data={{ content: item.content, fileUrl: item.image?.url }}
      disabled={editable}
    >
      <Editable
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
        ></PostCard>
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
