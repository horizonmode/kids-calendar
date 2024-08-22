import { Person } from "@/types/Items";
import { RiUserAddLine } from "@remixicon/react";
import { Icon } from "@tremor/react";
import Image from "next/image";

function PersonCard({
  person,
  hideName,
  selected,
  highlight,
  placeholder,
}: {
  person?: Person;
  hideName?: boolean;
  selected?: boolean;
  highlight?: boolean;
  placeholder?: boolean;
}) {
  return (
    <>
      <div
        className={`w-12 h-12 relative rounded-full border-2 border-green-500 ${
          selected
            ? "border-2 border-green-500 border-solid"
            : highlight
            ? "border-2 border-green-500 border-dashed"
            : "border-hidden"
        }`}
      >
        {placeholder ? (
          <Icon size="lg" icon={RiUserAddLine} className="rounded-full" />
        ) : (
          <Image
            className="bg-black rounded-full"
            src={person?.photo || "/static/17.jpg"}
            alt=""
            layout="fill"
          />
        )}
      </div>
      {!hideName && person?.name && (
        <div className="py-1">
          <h3 className=" text-center font-bold text-l text-gray-800 dark:text-white mb-1">
            {person.name}
          </h3>
        </div>
      )}
    </>
  );
}

export default PersonCard;
