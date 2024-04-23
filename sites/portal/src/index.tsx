import React from 'react';
import ReactDOM from 'react-dom/client';
import { Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { AuthCreation } from './pages/AuthCreation/AuthCreation';
import '@usecapsule/react-components/css/capsule-core.css';
import './portal.css';
import { ModalLayout } from './components/ModalLayout';
import { AuthLogin } from './pages/AuthLogin/AuthLogin';
import ShortUrl from './pages/ShortUrl/ShortUrl';
import { defineCustomElements } from '@usecapsule/react-components';
import Recovery from './pages/Recovery/Recovery';
import TransactionReview from './pages/TransactionReview/TransactionReview';

defineCustomElements();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route element={<Recovery />} path="/" />
      {/* Leaving this route above the /web wrapper for now to avoid dropping it in the ModalLayout. Can shift once designs for this are updated */}
      <Route
        element={<TransactionReview />}
        path="/web/users/:userId/transaction-review/:pendingTransactionId"
      />
      <Route element={<ModalLayout />} path="/web">
        <Route
          element={<AuthCreation />}
          path="users/:userId/biometrics/:biometricId"
        />
        <Route element={<AuthLogin />} path="biometrics/login" />
      </Route>
      <Route element={<ShortUrl />} path="/short/:shortenedUrl" />
    </Routes>
  </BrowserRouter>,
);
