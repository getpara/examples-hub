import { API_KEY } from "@/config/constants";
import { ParaWeb } from "@getpara/react-sdk-lite";

export const para = typeof window !== "undefined" && API_KEY ? new ParaWeb(API_KEY) : null;
