import WebApp from "@twa-dev/sdk";

export type CloudStorageKey = string;
export type CloudStorageValue = string;
export type CloudStorageItems = Record<CloudStorageKey, CloudStorageValue>;

export const telegramCloudStorage = {
  setItem: (
    key: CloudStorageKey,
    value: CloudStorageValue,
    callback?: (error: string | null, result?: boolean) => void
  ) => {
    WebApp.CloudStorage.setItem(key, value, callback);
  },

  getItem: (key: CloudStorageKey, callback?: (error: string | null, result?: CloudStorageValue) => void) => {
    WebApp.CloudStorage.getItem(key, callback);
  },

  getItems: (keys: Array<CloudStorageKey>, callback?: (error: string | null, result?: CloudStorageItems) => void) => {
    WebApp.CloudStorage.getItems(keys, callback);
  },

  getKeys: (callback?: (error: string | null, result?: Array<CloudStorageKey>) => void) => {
    WebApp.CloudStorage.getKeys(callback);
  },

  removeItem: (key: CloudStorageKey, callback?: (error: string | null, result?: boolean) => void) => {
    WebApp.CloudStorage.removeItem(key, callback);
  },

  removeItems: (keys: Array<CloudStorageKey>, callback?: (error: string | null, result?: boolean) => void) => {
    WebApp.CloudStorage.removeItems(keys, callback);
  },
};
