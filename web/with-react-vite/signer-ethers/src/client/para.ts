import { ParaWeb } from "@getpara/react-sdk";
import { API_KEY, ENVIRONMENT } from "../constants";

export const para = new ParaWeb(ENVIRONMENT, API_KEY);
