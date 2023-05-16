import Capsule, { Environment } from './library';

const env = process.env.REACT_APP_ENV
  ? (process.env.REACT_APP_ENV.toUpperCase() as Environment)
  : Environment.SANDBOX;

const capsule = new Capsule(env);

export default capsule;
