import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { capsule } from '../clients/capsule';

export const useLogout = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const logout = async () => {
    await capsule.logout();
    searchParams.delete('invite');
    if (pathname !== '/') {
      navigate({ pathname: '/', search: searchParams.toString() }, { replace: true });
    }
  };

  return { logout };
};
