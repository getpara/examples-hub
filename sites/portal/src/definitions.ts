import { Environment } from '@usecapsule/react-sdk';

export const ENV = process.env.REACT_APP_ENV
  ? (process.env.REACT_APP_ENV.toUpperCase() as Environment)
  : Environment.SANDBOX;
