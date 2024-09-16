import { Person } from "@/types/Items";
import {
  RiEdit2Line,
  RiUpload2Line,
  RiUploadCloudLine,
  RiUser2Fill,
  RiUser3Fill,
  RiUser3Line,
  RiUserAddLine,
  RiUserLine,
} from "@remixicon/react";
import { Button, Icon } from "@tremor/react";
import Image from "next/image";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

export interface PersonCardProps {
  person?: Person;
  hideName?: boolean;
  selected?: boolean;
  highlight?: boolean;
  placeholder?: boolean;
  editable?: boolean;
  onEdit?: (person: Person) => void;
  openImagePicker?: () => void;
}

function PersonCard({
  person,
  hideName,
  selected,
  highlight,
  placeholder,
  editable,
  onEdit,
  openImagePicker,
}: PersonCardProps) {
  const onNameChange = (e: ContentEditableEvent) => {
    if (person && e.target.value !== person.name && e.target.value !== "") {
      onEdit && onEdit({ ...person, name: e.target.value });
    }
  };

  return (
    <div className="flex flex-col justify-start items-center gap-1">
      <div
        className={`w-12 h-12 relative rounded-full border-2 border-green-500 ${
          selected
            ? "border-2 border-green-500 border-solid"
            : highlight
            ? "border-2 border-green-500 border-dashed"
            : "border-hidden"
        } ${editable ? "w-32 h-32" : ""}`}
      >
        {placeholder ? (
          <Icon
            size="lg"
            icon={RiUserLine}
            className="w-full h-full rounded-full"
          />
        ) : !person?.photo ? (
          <Icon
            size="lg"
            icon={RiUser3Fill}
            className="w-full h-full rounded-full bg-black"
          />
        ) : (
          <Image
            className="bg-black rounded-full"
            src={person.photo.url}
            alt=""
            layout="fill"
          />
        )}
      </div>
      {!hideName && person?.name && (
        <ContentEditable
          className={`whitespace-normal outline-none p-2 ${
            !editable && "text-xs"
          }`}
          tagName="h3"
          disabled={!editable} // use true to disable edition
          html={person.name || ""} // innerHTML of the editable div
          onChange={onNameChange} // handle innerHTML change
        />
      )}
      {editable && (
        <Button variant="light" icon={RiEdit2Line} onClick={openImagePicker}>
          Change Profile Picture
        </Button>
      )}
    </div>
  );
}

export default PersonCard;
