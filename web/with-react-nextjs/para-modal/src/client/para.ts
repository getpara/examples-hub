import { Environment, ParaWeb } from "@getpara/react-sdk";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY;
const ENVIRONMENT = process.env.NEXT_PUBLIC_PARA_ENVIRONMENT || Environment.BETA;

export const para = new ParaWeb(ENVIRONMENT, API_KEY);
