import axios, { AxiosInstance } from 'axios';

export function initClient(baseURL: string): AxiosInstance {
  return axios.create({ baseURL });
}
