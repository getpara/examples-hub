import { ParaWeb, Environment } from "@getpara/web-sdk";
import { PARA_API_KEY } from "@/config/constants";
import { validateEnv } from "@/config/env";

validateEnv();

export const para = new ParaWeb(Environment.BETA, PARA_API_KEY);