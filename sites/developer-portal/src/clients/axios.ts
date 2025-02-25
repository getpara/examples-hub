import axios, { AxiosInstance, AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { ENV_VARS } from '../utils/constants';
import { Environment } from '../types/environment';
import { getClient } from '@getpara/react-sdk';

function getBaseUrl(env: Environment): string {
  switch (env) {
    case Environment.DEV:
      return 'http://localhost:8080/';
    case Environment.SANDBOX:
      return 'https://api.sandbox.getpara.com/';
    case Environment.BETA:
      return 'https://api.beta.getpara.com/';
    case Environment.PROD:
      return 'https://api.getpara.com/';
    default:
      throw new Error(`unsupported env: ${env}`);
  }
}

const SESSION_COOKIE_HEADER_NAME = 'x-capsule-sid';

export const axiosClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(ENV_VARS.environment as Environment),
  headers: {
    'X-External-API-Key': ENV_VARS.paraApiKey,
  },
  transformRequest: [
    function (this: InternalAxiosRequestConfig, data: any, headers: AxiosRequestHeaders): any {
      const para = getClient();
      const currentSessionCookie = para?.retrieveSessionCookie();
      if (currentSessionCookie) {
        headers[SESSION_COOKIE_HEADER_NAME] = currentSessionCookie;
      }
      return data;
    },
  ].concat(axios.defaults.transformRequest ? axios.defaults.transformRequest : []),
});
