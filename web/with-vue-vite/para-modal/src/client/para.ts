import { Environment, ParaWeb } from "@getpara/react-sdk";

const API_KEY = import.meta.env.VITE_PARA_API_KEY;
const ENVIRONMENT = import.meta.env.VITE_PARA_ENVIRONMENT || Environment.BETA;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set VITE_PARA_API_KEY in your environment variables.");
}

export const para = new ParaWeb(ENVIRONMENT, API_KEY);
