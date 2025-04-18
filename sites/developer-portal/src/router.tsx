import { createBrowserRouter } from 'react-router-dom';
import { ApiKeyLayout, AuthenticatedLayout, InviteLayout, OnboardingLayout, UnauthenticatedLayout } from './layouts';
import { ApiKeySetup, Billing, EarlyAccess, Home, Invite, Landing, Onboarding, Project, Team } from './pages';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';

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
      { path: 'dashboard', element: <Home /> },
      { path: 'billing', element: <Billing /> },
      { path: 'team', element: <Team /> },
      { path: 'early-access', element: <EarlyAccess /> },
      {
        path: 'project/:projectId',
        element: <Project />,
      },
      {
        path: 'project/:projectId/key/:env/:apiKey',
        element: <ApiKeyLayout />,
        children: [{ path: ':apiKeyPage', element: <ApiKeySetup /> }],
      },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="authenticated" />,
      },
    ],
  },
]);
