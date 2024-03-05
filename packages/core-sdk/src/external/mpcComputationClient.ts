import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export function initClient(baseURL: string, useAdapter: boolean): AxiosInstance {
  const client = axios.create({ baseURL });
  if (useAdapter) {
    client.defaults.adapter = function(config: AxiosRequestConfig) {
      return fetch(config.baseURL + config.url, {
        method: config.method,
        headers: config.headers as [string, string][] | Record<string, string>,
        body: config.data,
        credentials: config.withCredentials ? 'include' : undefined
      }).then(response =>
        response.text().then(text => ({
          data: text,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          config: config,
          request: fetch
        }))
      ).catch(function(reason) {
        throw reason;
      });
    } as any;
  }

  return client;
}
