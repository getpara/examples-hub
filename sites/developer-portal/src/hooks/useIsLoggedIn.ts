import { useEffect, useState } from 'react';
import { capsule } from '../clients/capsule';
import { useLogout } from './useLogout';

export const useIsLoggedIn = () => {
  const { logout } = useLogout();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const _isLoggedIn = await capsule.isFullyLoggedIn();
      if (!_isLoggedIn) {
        await logout();
      }
      setIsLoggedIn(_isLoggedIn);
      setIsLoading(false);
    };

    checkLoggedIn();
  }, []);

  return { isLoggedIn, isLoading };
};
