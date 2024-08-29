import { Person } from "@/types/Items";
import { PersonResponse } from "@/utils/cosmosHandler";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

export interface PersonProps {
  people: Person[];
  id: string;
}

export interface PersonState {
  people: Person[];
  id: string;
  add: (person: Person) => void;
  edit: (person: Person) => void;
  delete: (personId: number) => void;
  pendingChanges: number;
  sync: (calendarId: string) => void;
  fetch: (calendarId: string) => void;
  editing: boolean;
  setEditing: (editing: boolean) => void;
}

export const createPersonStore = (initProps?: PersonProps) => {
  return createStore<PersonState>()((set, get) => ({
    pendingChanges: 0,
    people: initProps?.people || [],
    id: initProps?.id || "",
    editing: false,
    add: (person: Person) =>
      set({
        people: [...get().people, person],
        pendingChanges: get().pendingChanges + 1,
      }),
    edit: (person: Person) => {
      set((state) => {
        const newPeople = [...state.people];
        const index = newPeople.findIndex((p) => p.id === person.id);
        newPeople[index] = person;
        return { people: newPeople, pendingChanges: state.pendingChanges + 1 };
      });
    },
    delete: (personId: number) => {
      set((state) => {
        const newPeople = [...state.people];
        const index = newPeople.findIndex((person) => person.id === personId);
        newPeople[index].softDelete = true;
        return { people: newPeople, pendingChanges: state.pendingChanges + 1 };
      });
    },
    sync: async (calendarId: string) => {
      const remainingPeople = get().people.filter(
        (person) => !person.softDelete
      );

      const people: PersonResponse = {
        id: get().id,
        calendarId: calendarId,
        people: remainingPeople,
      };

      await fetch(`/api/update/${calendarId}/people`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(people),
      });
      set({ people: remainingPeople, pendingChanges: 0 });
    },
    fetch: async (calendarId: string) => {
      const response = await fetch(`/api/people/${calendarId}`);
      const res = (await response.json()) as PersonResponse[];
      const [peopleResponse] = res;
      set({ people: peopleResponse.people, id: peopleResponse.id });
    },
    setEditing: (editing: boolean) => set({ editing }),
  }));
};

export type PersonStore = ReturnType<typeof createPersonStore>;

export const PersonContext = createContext<PersonStore | null>(null);

export default function usePersonContext<T>(
  selector: (state: PersonState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(PersonContext);
  if (!store) throw new Error("Missing PersonContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}
