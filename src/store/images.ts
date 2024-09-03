import create, { createStore } from "zustand";
import { createContext, useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { GenericItem, Person } from "@/types/Items";

export interface Image {
  id: number;
  url: string;
}

export interface ImageProps {
  images: Image[];
}

export interface ImageState {
  images: Image[];
  addImage: (image: Image) => void;
  removeImage: (id: number) => void;
  fetchImages: (calendarId: string) => Promise<void>;
  selectedImage: Image | null;
  setSelectedImage: (id: Image | null) => void;
  editingItem: GenericItem | null;
  setEditingItem: (item: GenericItem | null) => void;
  editingPerson: Person | null;
  setEditingPerson: (person: Person | null) => void;
}

export const createImageStore = (initProps?: ImageProps) => {
  return createStore<ImageState>((set) => ({
    images: initProps?.images || [],
    addImage: (image) => set((state) => ({ images: [...state.images, image] })),
    removeImage: (id) =>
      set((state) => ({
        images: state.images.filter((image) => image.id !== id),
      })),
    fetchImages: async (calendarId) => {
      try {
        const response = await fetch(`/api/images/${calendarId}`);
        const images = (await response.json()) as Image[];
        set({ images });
      } catch (error) {
        console.error("Failed to fetch images:", error);
      }
    },
    selectedImage: null,
    setSelectedImage: (item) =>
      set((state: ImageState) => {
        if (state.editingItem) {
          const editingItem = state.editingItem;
          editingItem.file = item?.url;
        }
        if (state.editingPerson) {
          const editingPerson = state.editingPerson;
          editingPerson.photo = item?.url;
        }
        return { ...state, selectedImage: item };
      }),
    editingItem: null,
    setEditingItem: (item) =>
      set((state: ImageState) => {
        return { ...state, editingItem: item };
      }),
    editingPerson: null,
    setEditingPerson: (person) =>
      set((state: ImageState) => {
        return { ...state, editingPerson: person };
      }),
  }));
};

export type ImageStore = ReturnType<typeof createImageStore>;

export const ImageContext = createContext<ImageStore | null>(null);

export default function useImageContext<T>(
  selector: (state: ImageState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T {
  const store = useContext(ImageContext);
  if (!store) throw new Error("Missing ImageContext.Provider in the tree");
  return useStoreWithEqualityFn(store, selector, equalityFn);
}
