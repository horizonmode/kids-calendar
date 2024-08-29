import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
export type ModalType = "share" | "pending" | "saved" | "people";

export interface ModalState {
  showModal: ModalType | null;
  setShowModal: (showModal: ModalType | null) => void;
}

export const createModalStore = () => {
  return createStore<ModalState>()((set, get) => ({
    showModal: null,
    setShowModal: (showModal: ModalType | null) => set({ showModal }),
  }));
};

export type ModalStore = ReturnType<typeof createModalStore>;

export const ModalContext = createContext<ModalStore | null>(null);

export default function useModalContext<T>(
  selector: (state: ModalState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(ModalContext);
  if (!store) throw new Error("Missing ModalContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}
