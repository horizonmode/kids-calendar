import { GenericItem } from "@/types/Items";
import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

export interface GroupState {
  groupId: string | null;
  item: GenericItem | null;
  action: "add" | "remove" | null;
  setEditing: (id: string, item: GenericItem, action: "add" | "remove") => void;
  reset: () => void;
}

export const createGroupStore = () => {
  return createStore<GroupState>()((set, get) => ({
    groupId: null,
    item: null,
    action: null,
    setEditing: (groupId, item, action) => {
      set({ groupId, item, action });
    },
    reset: () => {
      set({ groupId: null, item: null, action: null });
    },
  }));
};

export type GroupStore = ReturnType<typeof createGroupStore>;

export const GroupContext = createContext<GroupStore | null>(null);

export default function useGroupContext<T>(
  selector: (state: GroupState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(GroupContext);
  if (!store) throw new Error("Missing GroupContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}
