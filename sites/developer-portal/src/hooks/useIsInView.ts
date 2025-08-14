import { useEffect, useRef, useState } from 'react';

export function useIsInView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit,
  onIntersectionCallback?: (_: boolean) => void,
) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
      onIntersectionCallback?.(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [options, onIntersectionCallback]);

  return { ref, isInView };
}
