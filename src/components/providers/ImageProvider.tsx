"use client";
import { createImageStore, ImageContext, ImageProps } from "@/store/images";

type ImageProviderProps = React.PropsWithChildren<ImageProps>;

export const ImageStoreProvider = ({
  children,
  ...props
}: ImageProviderProps) => {
  const store = createImageStore(props);

  return (
    <ImageContext.Provider value={store}>{children}</ImageContext.Provider>
  );
};
