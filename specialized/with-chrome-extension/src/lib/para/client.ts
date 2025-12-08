import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { ParaWeb } from "@getpara/react-sdk";
import { chromeStorageOverrides } from "../chrome-storage";

export const para = new ParaWeb(ENVIRONMENT, API_KEY, {
  ...chromeStorageOverrides,
  useStorageOverrides: true,
});

/**
 * A shared promise that resolves when `para.init()` finishes.
 * Import and `await` this in any script that needs Para.
 */
export const paraReady = para.init();
