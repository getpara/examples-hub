import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ApiKeyLayout, AuthenticatedLayout, InviteLayout, OnboardingLayout, UnauthenticatedLayout } from './layouts';
import { ApiKey, Billing, EarlyAccess, Home, Invite, Landing, Onboarding, Team } from './pages';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ProjectLayout } from './layouts/ProjectLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UnauthenticatedLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="unauthenticated" />,
      },
    ],
  },
  {
    path: '/invite',
    element: <InviteLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
    children: [
      { index: true, element: <Invite /> },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="unauthenticated" />,
      },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
    children: [
      { index: true, element: <Onboarding /> },
      { path: 'invite', element: <Invite isOnboarding /> },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="unauthenticated" />,
      },
    ],
  },
  {
    path: '/:organizationId',
    element: <AuthenticatedLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
    children: [
      { path: '', element: <Navigate to={'dashboard'} replace={true} /> },
      { path: 'dashboard', element: <Home /> },
      { path: 'billing', element: <Billing /> },
      { path: 'team', element: <Team /> },
      { path: 'early-access', element: <EarlyAccess /> },
      {
        path: 'project',
        element: <ProjectLayout />,
      },
      {
        path: 'project/:projectId',
        element: <ProjectLayout />,
        children: [
          {
            path: 'key/:env?/:apiKey?',
            element: <ApiKeyLayout />,
            children: [{ path: ':apiKeyPage', element: <ApiKey /> }],
          },
          { path: '*', element: <Navigate to={'key'} replace={true} /> },
          { path: '', element: <Navigate to={'key'} replace={true} /> },
        ],
      },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="authenticated" />,
      },
    ],
  },
]);
