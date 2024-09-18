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
  showPeople: boolean;
  setShowPeople: (showPeople: boolean) => void;
}

export const createPersonStore = (initProps?: PersonProps) => {
  return createStore<PersonState>()((set, get) => ({
    people: initProps?.people || [],
    setPeople: (people: Person[]) => set({ people }),
    add: (person: Person) =>
      set({
        people: [...get().people, person],
      }),
    edit: (person: Person) => {
      set((state) => {
        const newPeople = [...state.people];
        const index = newPeople.findIndex((p) => p.id === person.id);
        newPeople[index] = person;
        return { people: newPeople };
      });
    },
    showPeople: true,
    setShowPeople: (showPeople: boolean) => set({ showPeople }),
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
