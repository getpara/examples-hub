import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useLogout as useParaLogout } from '@getpara/react-sdk';

export const useLogout = () => {
  const { logoutAsync } = useParaLogout();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    await logoutAsync(undefined);
    searchParams.delete('invite');
    if (pathname !== '/') {
      navigate({ pathname: '/', search: searchParams.toString() }, { replace: true });
    }
  };

  return { logout };
};
