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
  showModal: ModalType | null;
  setShowModal: (showModal: ModalType | null) => void;
  pendingModal: ModalType | null;
  setPendingModal: (pendingModal: ModalType | null) => void;
}

export const createModalStore = () => {
  return createStore<ModalState>()((set, get) => ({
    showModal: null,
    setShowModal: (showModal: ModalType | null) => {
      const pendingModal = get().pendingModal;
      if (showModal === null && pendingModal) {
        set({ showModal: pendingModal, pendingModal: null });
        return;
      }
      set({ showModal });
    },
    pendingModal: null,
    setPendingModal: (pendingModal: ModalType | null) => set({ pendingModal }),
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
