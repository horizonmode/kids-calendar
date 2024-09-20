import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";

export type ModalType =
  | "share"
  | "pending"
  | "saved"
  | "people"
  | "gallery"
  | "photo";

export interface ModalState {
  activeModals: ModalType[];
  setActiveModals: (modal: ModalType, show: boolean) => void;
}

export const createModalStore = () => {
  return createStore<ModalState>()((set, get) => ({
    activeModals: [],
    setActiveModals: (modal: ModalType, show: boolean) => {
      const { activeModals } = get();
      if (show) {
        set({ activeModals: [...activeModals, modal] });
      } else {
        set({ activeModals: activeModals.filter((m) => m !== modal) });
      }
    },
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
