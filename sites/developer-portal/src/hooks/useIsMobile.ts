import { useLayoutEffect, useState } from 'react';
import { MOBILE_SIZE } from '../utils/constants';

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_SIZE);
    };
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};
