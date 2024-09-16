import { createStore } from "zustand";
import { createContext, useContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { Person, GalleryImage, PostCardItem } from "@/types/Items";

export interface ImageProps {
  images: GalleryImage[];
}

export interface ImageState {
  images: GalleryImage[];
  addImage: (image: GalleryImage) => void;
  removeImage: (id: number) => void;
  fetchImages: (calendarId: string) => Promise<void>;
  selectedImage: GalleryImage | null;
  setSelectedImage: (image: GalleryImage | null) => void;
  editingItem: PostCardItem | null;
  setEditingItem: (item: PostCardItem | null) => void;
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
        const images = (await response.json()) as GalleryImage[];
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
          editingItem.image = item;
        }
        if (state.editingPerson) {
          const editingPerson = state.editingPerson;
          editingPerson.photo = item;
        }
        return { ...state, selectedImage: item };
      }),
    editingItem: null,
    setEditingItem: (item) =>
      set((state: ImageState) => {
        return {
          ...state,
          editingItem: item,
          selectedImage: item?.image,
        };
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
