import { Person } from "@/types/Items";
import { PersonResponse } from "@/utils/cosmosHandler";
import { StateCreator } from "zustand";

export interface PersonState {
  people: Person[];
  addPerson: (person: Person) => void;
  editPerson: (person: Person) => void;
  deletePerson: (personId: number) => void;
  pendingChanges: number;
  syncPerson: (calendarId: string, id: string) => void;
  fetchPeople: (calendarId: string) => void;
  showPeople: boolean;
  setShowPeople: (showPeople: boolean) => void;
  getActivePeople: () => Person[];
}

export const createPeopleSlice: StateCreator<
  PersonState,
  [],
  [],
  PersonState
> = (set, get) => ({
  pendingChanges: 0,
  people: [],
  dbId: null,
  addPerson: (person: Person) =>
    set({
      people: [...get().people, person],
      pendingChanges: get().pendingChanges + 1,
    }),
  editPerson: (person: Person) => {
    set((state) => {
      const newPeople = [...state.people];
      const index = newPeople.findIndex((p) => p.id === person.id);
      newPeople[index] = person;
      return { people: newPeople, pendingChanges: state.pendingChanges + 1 };
    });
  },
  deletePerson: (personId: number) => {
    set((state) => {
      const newPeople = [...state.people];
      const index = newPeople.findIndex((person) => person.id === personId);
      newPeople[index].softDelete = true;
      return { people: newPeople, pendingChanges: state.pendingChanges + 1 };
    });
  },
  syncPerson: async (calendarId: string, id: string) => {
    const remainingPeople = get().people.filter((person) => !person.softDelete);

    const people: PersonResponse = {
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
  fetchPeople: async (calendarId: string) => {
    const response = await fetch(`/api/people/${calendarId}`);
    const res = (await response.json()) as PersonResponse;
    set({ people: res.people });
  },
  showPeople: true,
  setShowPeople: (showPeople: boolean) => set({ showPeople }),
  getActivePeople: () => get().people.filter((p) => !p.softDelete),
});
