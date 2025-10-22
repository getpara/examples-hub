import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLogout as useParaLogout } from '@getpara/react-sdk';
import { MainLoader } from '../components/MainLoader';

interface LogoutContextType {
  logout: () => Promise<void>;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

interface LogoutProviderProps {
  children: ReactNode;
}

export const LogoutProvider = ({ children }: LogoutProviderProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { logoutAsync } = useParaLogout();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    if (isLoggingOut) {
      return; // Prevent multiple concurrent logout calls
    }

    setIsLoggingOut(true);

    try {
      await logoutAsync(undefined);
      searchParams.delete('invite');
      if (pathname !== '/') {
        navigate({ pathname: '/', search: searchParams.toString() }, { replace: true });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, logoutAsync, searchParams, pathname, navigate]);

  if (isLoggingOut) {
    return <MainLoader />;
  }

  return <LogoutContext.Provider value={{ logout }}>{children}</LogoutContext.Provider>;
};

export const useLogoutContext = () => {
  const context = useContext(LogoutContext);
  if (context === undefined) {
    throw new Error('useLogoutContext must be used within a LogoutProvider');
  }
  return context;
};
