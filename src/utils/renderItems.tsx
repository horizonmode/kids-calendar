import { GenericItem, GroupItem, PostCardItem } from "@/types/Items";
import Draggable from "@/components/Draggable";
import Editable from "@/components/Editable";
import PersonAssignment from "@/components/PersonAssignment";
import PostCard from "@/components/PostCard";
import { CSSProperties } from "react";
import Note from "@/components/Note";
import Group from "@/components/Group";
import { createPortal } from "react-dom";
import { transform } from "next/dist/build/swc";
import { Sortable } from "@/components/Sortable";
import { SortableContext } from "@dnd-kit/sortable";
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
  key: string,
  style?: React.CSSProperties,
  sortable: boolean = false
) => {
  const note = (
    <>
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
    </>
  );
  return !sortable ? (
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
      {note}
    </Draggable>
  ) : (
    <Sortable
      id={item.id}
      element="post-it"
      key={key}
      data={{ content: item.content, color: item.color }}
    >
      {note}
    </Sortable>
  );
};

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
  key: string,
  style?: React.CSSProperties,
  sortable: boolean = false
) => {
  const postcard = (
    <>
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
          style={style}
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
    </>
  );
  return !sortable ? (
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
      {postcard}
    </Draggable>
  ) : (
    <Sortable
      id={item.id}
      element="post-card"
      key={key}
      data={{ content: item.content, fileUrl: item.image?.url }}
    >
      {postcard}
    </Sortable>
  );
};

export const renderGroup = (
  item: GroupItem,
  editable: boolean,
  onItemUpdate: (item: Partial<GenericItem>) => void,
  onItemDelete: (item: GenericItem) => void,
  onItemSelect: (item: GenericItem) => void,
  onItemDeselect: (item: GenericItem) => void,
  onGroupClick: (item: GenericItem) => void,
  onGroupClose: () => void,
  selected: boolean,
  showPeople: boolean,
  disablePeople: boolean,
  locked: boolean,
  key: string,
  disableSort: boolean,
  isOver: boolean
) => {
  return (
    <Draggable
      id={item.id}
      key={key}
      left={`${item.x || 50}%`}
      top={`${item.y || 50}%`}
      style={getStyle(item)}
      element="group"
      data={{ content: item.content, itemId: item.id }}
      disabled={editable || disableSort}
    >
      <Editable
        onDelete={() => onItemDelete(item)}
        color={item.color || "#0096FF"}
        onChangeColor={(color: string) => {
          onItemUpdate({ color });
        }}
        onSelect={(selected) => {
          if (selected) {
            onItemSelect(item);
            onGroupClick(item);
          } else {
            onItemDeselect(item);
            onGroupClose();
          }
        }}
        editable={editable}
        position="right"
        className={`${locked ? "hidden" : ""}`}
      >
        {selected ? (
          <Group
            selected={true}
            onClick={() => onGroupClick(item)}
            onClose={() => onGroupClose()}
            id={item.id}
            disableSort={disableSort}
            data={item}
            isOver={isOver}
          ></Group>
        ) : (
          <Group
            selected={false}
            onClick={() => onGroupClick(item)}
            onClose={() => onGroupClose()}
            id={item.id}
            data={item}
            disableSort={disableSort}
            isOver={isOver}
          ></Group>
        )}
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
