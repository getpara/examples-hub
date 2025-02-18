import { Environment, ParaWeb } from "@getpara/react-sdk";

const API_KEY = import.meta.env.VITE_PARA_API_KEY;

export const para = new ParaWeb(Environment.BETA, API_KEY);
