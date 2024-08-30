"use client";
import { useRef } from "react";

import {
  TemplateContext,
  TemplateProps,
  TemplateStore,
  createTemplateStore,
} from "@/store/template";

type TemplateProviderProps = React.PropsWithChildren<TemplateProps>;

export default function TemplateProvider({
  children,
  ...props
}: TemplateProviderProps) {
  const storeRef = useRef<TemplateStore>();
  if (!storeRef.current) {
    storeRef.current = createTemplateStore(props);
  }

  return (
    <TemplateContext.Provider value={storeRef.current}>
      {children}
    </TemplateContext.Provider>
  );
}
