import { useEffect, useState } from "react";

export function useLoadingProgress(isLoading: boolean) {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    let intervalId: number | undefined;

    if (isLoading) {
      setShowContent(false);
      setLoadingProgress(0);

      intervalId = window.setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 15) {
            if (intervalId !== undefined) window.clearInterval(intervalId);
            return prev;
          }
          return prev + 1;
        });
      }, 80);
    } else {
      intervalId = window.setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            if (intervalId !== undefined) window.clearInterval(intervalId);
            setShowContent(true);
            return 100;
          }
          return prev + 5;
        });
      }, 40);
    }

    return () => {
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }, [isLoading]);

  return { loadingProgress, showContent };
}
