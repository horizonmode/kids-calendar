import Router from "next/router";
import { useEffect, useState } from "react";

const useWarnIfUnsavedChanges = (
  unsavedChanges: boolean,
  callback: () => boolean
) => {
  const [savedRoute, setSavedRoute] = useState<string | null>(null);

  useEffect(() => {
    if (unsavedChanges) {
      const routeChangeStart = (route: string) => {
        setSavedRoute(route);
        const ok = callback();
        if (!ok) {
          Router.events.emit("routeChangeError");
          throw "Abort route change. Please ignore this error.";
        }
      };
      Router.events.on("routeChangeStart", routeChangeStart);

      return () => {
        Router.events.off("routeChangeStart", routeChangeStart);
      };
    }
  }, [callback, unsavedChanges]);

  return { savedRoute };
};

export default useWarnIfUnsavedChanges;
