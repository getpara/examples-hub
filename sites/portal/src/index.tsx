import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import '@getpara/react-components/css/capsule-core.css';
import './portal.css';
import { ModalLayout } from './components/ModalLayout';
import { defineCustomElements } from '@getpara/react-components';
import { ParaProvider } from './components/ParaContext';
import { AuthLoginStep, ENV } from './constants';
import { AuthMethod } from '@getpara/web-sdk';
import { lazy } from 'react';
import './clients/sentry';

defineCustomElements();

const Recovery = lazy(() => import('./pages/Recovery/Recovery'));
const AuthCreation = lazy(() =>
  import('./pages/AuthCreation/AuthCreation').then(module => ({ default: module.AuthCreation })),
);
const AuthLogin = lazy(() => import('./pages/AuthLogin/AuthLogin').then(module => ({ default: module.AuthLogin })));
const PasswordCreation = lazy(() =>
  import('./pages/PasswordCreation/PasswordCreation').then(module => ({ default: module.PasswordCreation })),
);
const PINCreation = lazy(() => import('./pages/PINCreation/PINCreation').then(module => ({ default: module.PINCreation })));
const TransactionReview = lazy(() => import('./pages/TransactionReview/TransactionReview'));
const OnRampTransaction = lazy(() =>
  import('./pages/OnRampTransaction').then(module => ({ default: module.OnRampTransaction })),
);
const OnRampTransactionV2 = lazy(() =>
  import('./pages/OnRampTransactionV2').then(module => ({ default: module.OnRampTransactionV2 })),
);
const TelegramLogin = lazy(() =>
  import('./pages/TelegramLogin/TelegramLogin').then(module => ({ default: module.TelegramLogin })),
);
const OAuthLogin = lazy(() => import('./pages/OAuth/OAuthLogin').then(module => ({ default: module.OAuthLogin })));
const ShortUrl = lazy(() => import('./pages/ShortUrl/ShortUrl'));

export const App = () => {
  const [searchParams] = useSearchParams();
  const apiKey = searchParams.get('apiKey') || undefined;
  const partnerId = searchParams.get('partnerId') || undefined;

  return (
    <ParaProvider
      apiKey={apiKey}
      partnerId={partnerId}
      environment={ENV}
      options={{ useSessionStorage: true }}
      onMount={para => para.clearStorage('local')}
    >
      <Routes>
        <Route element={<Recovery />} path="/" />
        {/* Leaving this route above the /web wrapper for now to avoid dropping it in the ModalLayout. Can shift once designs for this are updated */}
        <Route element={<ModalLayout />} path="/web">
          <Route element={<AuthCreation />} path="users/:userId/biometrics/:biometricId" />
          <Route element={<AuthLogin authMethod={AuthMethod.PASSKEY} />} path="biometrics/login" />
          <Route element={<AuthLogin authMethod={AuthMethod.PASSWORD} />} path="passwords/login/:version?" />
          <Route element={<AuthLogin authMethod={AuthMethod.PIN} />} path="pin/login" />
          <Route element={<PasswordCreation />} path="users/:userId/passwords/:passwordId" />
          <Route element={<PINCreation />} path="users/:userId/pin/:passwordId" />
          <Route element={<TransactionReview />} path="users/:userId/transaction-review/:pendingTransactionId" />
          <Route element={<OnRampTransaction />} path="users/:userId/on-ramp-transaction/:purchaseId" />
          <Route element={<OnRampTransactionV2 />} path="users/:userId/on-ramp-transaction/v2/:purchaseId" />
        </Route>
        <Route element={<ModalLayout />} path="/auth">
          <Route element={<TelegramLogin />} path="telegram" />
          <Route element={<AuthLogin step={AuthLoginStep.TELEGRAM} />} path="telegram/verify" />
          <Route element={<AuthLogin step={AuthLoginStep.FARCASTER} />} path="farcaster" />
          <Route element={<AuthLogin step={AuthLoginStep.OTP} />} path="otp" />
          <Route element={<AuthLogin step={AuthLoginStep.OAUTH_CALLBACK} />} path=":method/callback" />
          <Route element={<OAuthLogin />} path=":method" />
        </Route>
        <Route element={<ShortUrl />} path="/short/:shortenedUrl" />
      </Routes>
    </ParaProvider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
