import { ParaWeb } from "@getpara/react-sdk-lite";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY ?? "";

if (!API_KEY) {
  console.warn("NEXT_PUBLIC_PARA_API_KEY is not set. Para authentication will not work.");
}

export const para = typeof window !== "undefined" && API_KEY ? new ParaWeb(API_KEY) : null;
