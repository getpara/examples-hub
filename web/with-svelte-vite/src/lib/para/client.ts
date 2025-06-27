import { ParaWeb } from "@getpara/web-sdk";
import { API_KEY, ENVIRONMENT } from "@/config/constants";

export const para = new ParaWeb(ENVIRONMENT, API_KEY);