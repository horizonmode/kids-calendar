import { createContext, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { persist, PersistStorage, StateStorage } from "zustand/middleware";

export interface UIState {
    locked: boolean;
    setLocked: (locked: boolean) => void;
}

interface UIStorageState {
    locked: boolean;
}
const localStoragePersist: PersistStorage<UIStorageState> = {
    getItem: (name) => {
        const item = localStorage.getItem(name);
        return item ? JSON.parse(item) : null;
    },
    setItem: (name, value) => {
        localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name) => {
        localStorage.removeItem(name);
    }
};

export const createUIStore = () => {
    return createStore<UIState>()(
        persist(
            (set) => ({
                locked: true,
                setLocked: (locked: boolean) => set({ locked }),
            }),
            {
                name: "ui-storage",
                storage: localStoragePersist,
                partialize: (state) => ({ locked: state.locked }),
            }
        )
    );
};

export type UIStore = ReturnType<typeof createUIStore>;

export const UIContext = createContext<UIStore | null>(null);

export default function useUIContext<T>(
    selector: (state: UIState) => T,
    equalityFn?: (left: T, right: T) => boolean
): T {
    const store = useContext(UIContext);
    if (!store) throw new Error("Missing UIContext.Provider in the tree");
    return useStoreWithEqualityFn(store, selector, equalityFn);
}