import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { para } from '../clients/para';

export const useLogout = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    await para.logout();
    searchParams.delete('invite');
    if (pathname !== '/') {
      navigate({ pathname: '/', search: searchParams.toString() }, { replace: true });
    }
  };

  return { logout };
};
