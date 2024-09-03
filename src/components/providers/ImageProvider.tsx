"use client";
import {
  createImageStore,
  ImageContext,
  ImageProps,
  ImageStore,
} from "@/store/images";
import { useRef } from "react";

type ImageProviderProps = React.PropsWithChildren<ImageProps>;

export const ImageStoreProvider = ({
  children,
  ...props
}: ImageProviderProps) => {
  const storeRef = useRef<ImageStore>();
  if (!storeRef.current) {
    storeRef.current = createImageStore(props);
  }
  return (
    <ImageContext.Provider value={storeRef.current}>
      {children}
    </ImageContext.Provider>
  );
};
