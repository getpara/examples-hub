import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { ParaWeb } from "@getpara/react-sdk";

export const para = typeof window !== "undefined" ? new ParaWeb(ENVIRONMENT, API_KEY) : null;
