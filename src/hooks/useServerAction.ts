import { useState, useEffect, useTransition, useRef, useCallback } from "react";

export const useServerAction = <P extends any[], R>(
  action: (...args: P) => Promise<R>,
  onFinished?: (_: R | undefined) => void
): [(...args: P) => Promise<R | undefined>, boolean, boolean] => {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<R>();
  const [finished, setFinished] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);
  const resolver = useRef<(value?: R | PromiseLike<R>) => void>();

  useEffect(() => {
    if (!finished) return;

    if (onFinished) onFinished(result);
    resolver.current?.(result);
  }, [result, finished, onFinished]);

  const runAction = useCallback(
    async (...args: P): Promise<R | undefined> => {
      startTransition(() => {
        try {
          action(...args).then((data) => {
            setResult(data);
            setFinished(true);
          });
        } catch (err) {
          setIsError(true);
        }
      });

      return new Promise((resolve, reject) => {
        console.log(isError);
        resolver.current = isError ? reject : resolve;
      });
    },
    [action]
  );

  return [runAction, isPending, isError];
};
