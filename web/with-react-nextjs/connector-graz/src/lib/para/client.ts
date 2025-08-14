import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { ParaWeb } from "@getpara/graz-integration";

export const para = typeof window !== "undefined" ? new ParaWeb(ENVIRONMENT, API_KEY) : null;
