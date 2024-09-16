import { useDroppable } from "@dnd-kit/core";
import PersonCard from "./PersonCard";
import Draggable from "./Draggable";
import usePersonContext from "@/store/people";

interface PersonAssignmentProps {
  peopleIds: number[] | null;
  id: string;
  disabled?: boolean;
  editing?: boolean;
  style?: React.CSSProperties;
}

function PersonAssignment({
  peopleIds,
  id,
  disabled = true,
  style,
}: PersonAssignmentProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  console.log("PersonAssignment", peopleIds);

  const [people] = usePersonContext((state) => [state.getActivePeople()]);

  const selectedPeople = people.filter((person) =>
    peopleIds?.includes(person.id)
  );

  return (
    <div className="flex flex-row justify-start" style={style}>
      <div
        id={`person-droppable-${id}`}
        ref={setNodeRef}
        className="items-center justify-start relative box-border transition-shadow duration-[250ms] ease-[ease] flex flex-row pointer-events-auto"
        aria-label="Droppable region"
      >
        {selectedPeople && selectedPeople.length > 0 ? (
          selectedPeople?.map((person, i) => (
            <Draggable
              id={`person-assignment-${id}-${i}`}
              key={`person-assignment-${id}-${i}`}
              data={{
                person: person,
                itemId: person.id,
                sourceId: id,
              }}
              style={{ position: "relative" }}
              element="people"
            >
              <PersonCard
                highlight={!disabled}
                selected={isOver && !disabled}
                person={person}
                hideName={true}
              />
            </Draggable>
          ))
        ) : (
          <PersonCard
            hideName={true}
            placeholder={true}
            highlight={!disabled}
            selected={isOver && !disabled}
          />
        )}
      </div>
    </div>
  );
}

export default PersonAssignment;
