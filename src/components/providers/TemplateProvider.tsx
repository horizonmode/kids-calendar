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
  const store = createTemplateStore(props);

  return (
    <TemplateContext.Provider value={store}>
      {children}
    </TemplateContext.Provider>
  );
}
