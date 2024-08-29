import axios, { AxiosInstance, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { ENV_VARS } from '../utils/constants';
import { Environment } from '../types/environment';
import { capsule } from './capsule';

function getBaseUrl(env: Environment): string {
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:8080/';
    case Environment.SANDBOX:
      return 'https://api.sandbox.usecapsule.com/';
    case Environment.BETA:
      return 'https://api.beta.usecapsule.com/';
    case Environment.PROD:
      return 'https://api.usecapsule.com/';
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

const SESSION_COOKIE_HEADER_NAME = 'x-capsule-sid';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(ENV_VARS.environment as Environment),
  headers: {
    'X-External-API-Key': ENV_VARS.capsuleApiKey,
  },
  transformRequest: [
    function (this: InternalAxiosRequestConfig, data: any, headers: AxiosRequestHeaders): any {
      const currentSessionCookie = capsule.retrieveSessionCookie();
      if (currentSessionCookie) {
        headers[SESSION_COOKIE_HEADER_NAME] = currentSessionCookie;
      }
      return data;
    },
  ].concat(axios.defaults.transformRequest ? axios.defaults.transformRequest : []),
});
