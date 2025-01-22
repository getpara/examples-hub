import { Environment, CapsuleWeb } from "@usecapsule/react-sdk";

const API_KEY = process.env.NEXT_PUBLIC_CAPSULE_API_KEY;

export const capsule = new CapsuleWeb(Environment.BETA, API_KEY);
