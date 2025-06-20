"use client";

import { createUIStore, UIContext } from "@/store/ui";

export default function UIProvider({ children }: React.PropsWithChildren) {
  const store = createUIStore();
  return <UIContext.Provider value={store}>{children}</UIContext.Provider>;
}
