"use client";
import { CosmosItem, People, Person } from "@/types/Items";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

export interface PersonProps {
  people: Person[];
}

export interface PersonState {
  people: Person[];
  setPeople: (people: Person[]) => void;
  add: (person: Person) => void;
  edit: (person: Person) => void;
  delete: (personId: number) => void;
  pendingChanges: number;
  sync: (calendarId: string) => void;
  fetch: (calendarId: string) => void;
  showPeople: boolean;
  setShowPeople: (showPeople: boolean) => void;
  getActivePeople: () => Person[];
}

export const createPersonStore = (initProps?: PersonProps) => {
  return createStore<PersonState>()((set, get) => ({
    pendingChanges: 0,
    people: initProps?.people || [],
    setPeople: (people: Person[]) => set({ people }),
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

      const people: CosmosItem<People> = {
        calendarId: calendarId,
        people: remainingPeople,
        id: `${calendarId}-people`,
        type: "people",
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
      const res = (await response.json()) as CosmosItem<People>;
      set({ people: res.people });
    },
    showPeople: true,
    setShowPeople: (showPeople: boolean) => set({ showPeople }),
    getActivePeople: () => get().people.filter((p) => !p.softDelete),
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
