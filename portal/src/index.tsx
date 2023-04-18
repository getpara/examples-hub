import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Routes, Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import AuthCreation from './AuthCreation';
import AuthLogin from './AuthLogin';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />} path="/" />
        <Route
          element={<AuthCreation />}
          path="/web/users/:userId/biometrics/:biometricId"
        />
        <Route element={<AuthLogin />} path="/web/biometrics/login" />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
