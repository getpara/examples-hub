import { useNavigate } from 'react-router-dom';
import { capsule } from '../clients/capsule';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    await capsule.logout();
    navigate('/login', { replace: true });
  };

  return { logout };
};
