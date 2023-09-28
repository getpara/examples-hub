import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import AuthCreation from './AuthCreation';
import AuthLogin from './AuthLogin';
import ShortUrl from './ShortUrl';
import TransactionReview from './TransactionReview';
import '../src/portal.css'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <div className='font-hanken'>
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route element={<App />} path="/" />
          <Route
            element={<AuthCreation />}
            path="/web/users/:userId/biometrics/:biometricId"
          />
          <Route element={<AuthLogin />} path="/web/biometrics/login" />
          <Route element={<ShortUrl />} path="/short/:shortenedUrl" />
          <Route
            element={<TransactionReview />}
            path="/web/users/:userId/transaction-review/:pendingTransactionId"
          />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  </div>,
);
