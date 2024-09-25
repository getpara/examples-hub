import { createBrowserRouter } from 'react-router-dom';
import { AuthenticatedLayout, OnboardingLayout, UnauthenticatedLayout } from './layouts';
import { ApiKey, Billing, EarlyAccess, Home, Login, Onboarding, Project, Team } from './pages';

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    children: [{ index: true, element: <Onboarding /> }],
  },
  {
    path: '/',
    element: <AuthenticatedLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'billing', element: <Billing /> },
      { path: 'team', element: <Team /> },
      { path: 'early-access', element: <EarlyAccess /> },
      {
        path: 'project/:projectId',
        element: <Project />,
      },
      {
        path: 'project/:projectId/key/:env/:apiKey',
        element: <ApiKey />,
      },
    ],
  },
  {
    path: '/login',
    element: <UnauthenticatedLayout />,
    children: [{ index: true, element: <Login /> }],
  },
]);
