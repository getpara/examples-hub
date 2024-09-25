import { Outlet } from 'react-router-dom';
import { UnAuthAppBar } from '../../components/AppBar/UnAuthAppBar';
import { AuthenticatedWrapper } from '../../components/AuthenticatedWrapper/AuthenticatedWrapper';
import { UnAuthMain } from '../unauthenticated/Layout';

export const Layout = () => {
  return (
    <AuthenticatedWrapper>
      <UnAuthAppBar />
      <UnAuthMain>
        <Outlet />
      </UnAuthMain>
    </AuthenticatedWrapper>
  );
};
