import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router';
import { BrowserRouter, useSearchParams } from 'react-router-dom';
import { AuthCreation } from './pages/AuthCreation/AuthCreation';
import '@usecapsule/react-components/css/capsule-core.css';
import './portal.css';
import { ModalLayout } from './components/ModalLayout';
import { AuthLogin } from './pages/AuthLogin/AuthLogin';
import ShortUrl from './pages/ShortUrl/ShortUrl';
import { defineCustomElements } from '@usecapsule/react-components';
import { CapsuleProvider } from './components/CapsuleContext';
import Recovery from './pages/Recovery/Recovery';
import { ENV } from './constants';
import TransactionReview from './pages/TransactionReview/TransactionReview';
import { OnRampTransaction } from './pages/OnRampTransaction';

defineCustomElements();

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
          <Route element={<AuthLogin />} path="biometrics/login" />
          <Route element={<TransactionReview />} path="users/:userId/transaction-review/:pendingTransactionId" />
          <Route element={<OnRampTransaction />} path="users/:userId/on-ramp-transaction/:purchaseId" />
        </Route>
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
