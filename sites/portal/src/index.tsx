import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import '@usecapsule/react-components/css/capsule-core.css';
import './portal.css';
import { ModalLayout } from './components/ModalLayout';
import { defineCustomElements } from '@usecapsule/react-components';
import { CapsuleProvider } from './components/CapsuleContext';
import { ENV } from './constants';
import { AuthMethod } from '@usecapsule/web-sdk';
import { lazy } from 'react';

defineCustomElements();

const Recovery = lazy(() => import('./pages/Recovery/Recovery'));
const AuthCreation = lazy(() =>
  import('./pages/AuthCreation/AuthCreation').then(module => ({ default: module.AuthCreation })),
);
const AuthLogin = lazy(() => import('./pages/AuthLogin/AuthLogin').then(module => ({ default: module.AuthLogin })));
const PasswordCreation = lazy(() =>
  import('./pages/PasswordCreation/PasswordCreation').then(module => ({ default: module.PasswordCreation })),
);
const TransactionReview = lazy(() => import('./pages/TransactionReview/TransactionReview'));
const OnRampTransaction = lazy(() =>
  import('./pages/OnRampTransaction').then(module => ({ default: module.OnRampTransaction })),
);
const TelegramLogin = lazy(() => import('./pages/TelegramLogin').then(module => ({ default: module.TelegramLogin })));
const ShortUrl = lazy(() => import('./pages/ShortUrl/ShortUrl'));

const App = () => {
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get('apiKey') || undefined;

  return (
    <CapsuleProvider
      apiKey={apiKey}
      environment={ENV}
      options={{ useSessionStorage: true }}
      onMount={capsule => capsule.clearStorage('local')}
    >
      <Routes>
        <Route element={<Recovery />} path="/" />
        {/* Leaving this route above the /web wrapper for now to avoid dropping it in the ModalLayout. Can shift once designs for this are updated */}
        <Route element={<ModalLayout />} path="/web">
          <Route element={<AuthCreation />} path="users/:userId/biometrics/:biometricId" />
          <Route element={<AuthLogin authMethod={AuthMethod.PASSKEY} />} path="biometrics/login" />
          <Route element={<AuthLogin authMethod={AuthMethod.PASSWORD} />} path="passwords/login" />
          <Route element={<PasswordCreation />} path="users/:userId/passwords/:passwordId" />
          <Route element={<TransactionReview />} path="users/:userId/transaction-review/:pendingTransactionId" />
          <Route element={<OnRampTransaction />} path="users/:userId/on-ramp-transaction/:purchaseId" />
        </Route>
        <Route element={<TelegramLogin />} path="/auth/telegram" />
        <Route element={<ShortUrl />} path="/short/:shortenedUrl" />
      </Routes>
    </CapsuleProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
