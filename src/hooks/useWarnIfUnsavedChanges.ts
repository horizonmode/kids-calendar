import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const useWarnIfUnsavedChanges = (
  unsavedChanges: boolean,
  callback: () => boolean
) => {
  const router = useRouter();

  useEffect(() => {
    const _push = router.push.bind(router);

    router.push = (href, options) => {
      if (unsavedChanges) {
        if (!callback()) {
          return;
        }
      }
      _push(href, options);
    };
    return () => {
      router.push = _push;
    };
  }, [unsavedChanges, callback, router]);

  return null;
};

export default useWarnIfUnsavedChanges;
