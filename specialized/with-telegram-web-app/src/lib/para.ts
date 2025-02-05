import { ParaWeb, Environment } from "@getpara/web-sdk";

const PARA_ENV: Environment = Environment.BETA;
const PARA_API_KEY = import.meta.env.VITE_PARA_API_KEY;

const para = new ParaWeb(PARA_ENV, PARA_API_KEY, {});

export default para;
