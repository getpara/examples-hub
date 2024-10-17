import { createBrowserRouter } from 'react-router-dom';
import { AuthenticatedLayout, OnboardingLayout, UnauthenticatedLayout } from './layouts';
import { ApiKey, Billing, EarlyAccess, Home, Login, Onboarding, Project, Team } from './pages';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: <OnboardingLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
    children: [
      { index: true, element: <Onboarding /> },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="unauthenticated" />,
      },
    ],
  },
  {
    path: '/',
    element: <AuthenticatedLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
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
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="authenticated" />,
      },
    ],
  },
  {
    path: '/login',
    element: <UnauthenticatedLayout />,
    errorElement: <ErrorBoundary variant="error" containerType="fullScreen" captureSentryError />,
    children: [
      { index: true, element: <Login /> },
      {
        path: '*',
        element: <ErrorBoundary variant="notFound" containerType="unauthenticated" />,
      },
    ],
  },
]);
