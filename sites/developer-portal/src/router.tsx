import { createBrowserRouter } from 'react-router-dom';
import { AuthenticatedLayout, UnauthenticatedLayout } from './layouts';
import { EarlyAccess, Home, Settings } from './pages';
import { ApiKey } from './pages/ApiKey/ApiKey';
import { Login } from './pages/Login/Login';
import { RequestAccess } from './pages/RequestAccess/RequestAccess';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthenticatedLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'settings', element: <Settings /> },
      { path: 'early-access', element: <EarlyAccess /> },
      { path: '/key/:env/:apiKey', element: <ApiKey /> },
    ],
  },
  {
    path: '/login',
    element: <UnauthenticatedLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: 'request-access', element: <RequestAccess /> },
    ],
  },
]);
