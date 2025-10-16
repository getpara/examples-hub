import { MutableRefObject, useEffect, useState } from 'react';

export const useDropdownPosition = (inputRef: MutableRefObject<HTMLCpslInputElement | HTMLDivElement | null>) => {
  const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number | undefined>();
  const [dropdownWidth, setDropdownWidth] = useState<number | undefined>();
  const [mobileAnchor, setMobileAnchor] = useState<number | undefined>();

  const resize = () => {
    if (typeof window !== 'undefined') {
      const newMaxHeight = Math.max(
        window.innerHeight - (inputRef?.current?.getBoundingClientRect().bottom ?? 0) - 20,
        window.innerHeight * 0.25,
      );
      setDropdownMaxHeight(newMaxHeight);
      setDropdownWidth(inputRef?.current?.getBoundingClientRect().width);
      setMobileAnchor(inputRef?.current?.getBoundingClientRect().height);
    }
  };

  if (inputRef.current && !dropdownMaxHeight) {
    resize();
  }

  useEffect(() => {
    typeof window !== 'undefined' && window.addEventListener('resize', resize);

    return () => {
      typeof window !== 'undefined' && window.removeEventListener('resize', resize);
    };
  }, []);

  return { dropdownMaxHeight, dropdownWidth, mobileAnchor, resize };
};
