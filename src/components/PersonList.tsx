import usePersonContext from "@/store/people";
import { RiUser3Line, RiEdit2Line, RiDeleteBin2Line } from "@remixicon/react";
import { Icon, List, ListItem } from "@tremor/react";
import Image from "next/image";
import { shallow } from "zustand/shallow";

interface PersonEditProps {
  onPersonSelect: (personId: number) => void;
}

const PersonEdit = ({ onPersonSelect }: PersonEditProps) => {
  const [people, deletePerson] = usePersonContext(
    (state) => [state.people, state.delete],
    shallow
  );

  return (
    <List>
      {people.map((person) => {
        return (
          <ListItem key={person.id} className="flex items-center">
            <div className="flex items-center justify-start gap-2">
              {!person.photo ? (
                <Icon size="lg" icon={RiUser3Line} />
              ) : (
                <Image
                  className="bg-black rounded-full"
                  src={person.photo.url}
                  alt=""
                  width={48}
                  height={48}
                />
              )}
              <h3 className="text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {person.name}
              </h3>
            </div>
            <div className="flex items-center">
              <Icon
                size="lg"
                icon={RiEdit2Line}
                onClick={() => {
                  onPersonSelect(person.id);
                }}
              />
              <Icon
                onClick={() => {
                  deletePerson(person.id);
                }}
                size="lg"
                icon={RiDeleteBin2Line}
              />
            </div>
          </ListItem>
        );
      })}
    </List>
  );
};

export default PersonEdit;
