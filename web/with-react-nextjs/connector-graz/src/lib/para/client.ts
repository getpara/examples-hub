import { API_KEY, ENVIRONMENT } from "@/config/constants";
import { ParaWeb } from "@getpara/react-sdk-lite";

export const para = typeof window !== "undefined" ? new ParaWeb(ENVIRONMENT, API_KEY) : null;
