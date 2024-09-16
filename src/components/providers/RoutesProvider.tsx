"use client";
import routes from "@/data/routes";
import { createContext, ReactNode, useContext } from "react";

interface Routes {
  calendar: string;
  schedule: string;
  template: string;
  home: string;
}

const RoutesProvider = ({
  children,
  calendarId,
}: {
  children: ReactNode;
  calendarId: string;
}) => {
  return (
    <RoutesContext.Provider value={routes(calendarId)}>
      {children}
    </RoutesContext.Provider>
  );
};

const RoutesContext = createContext<Routes | null>(null);

const useRoutes = () => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error("useRoutes must be used within a RoutesProvider");
  }
  return context;
};

export default RoutesProvider;
export { RoutesContext, useRoutes };
