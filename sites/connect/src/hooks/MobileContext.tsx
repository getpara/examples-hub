import { useState, useEffect } from 'react';

const useIsMobile = () => {
  const [isMobileState, setIsMobileState] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobileState(window.innerWidth <= 768);
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobileState;
};

export default useIsMobile;
