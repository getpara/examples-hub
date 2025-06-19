import type { ParaWeb as Para } from "@getpara/react-sdk";
import { hashMessage } from "viem";
import type { Hash, SignableMessage } from "viem";

const SIGNATURE_LENGTH = 130;
const V_OFFSET_FOR_ETHEREUM = 27;

function hexStringToBase64(hex: string): string {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = Buffer.from(cleanHex, "hex");
  return bytes.toString("base64");
}

function parseSignature(signature: string): { r: string; s: string; v: number } {
  const cleanSig = signature.startsWith("0x") ? signature.slice(2) : signature;

  if (cleanSig.length !== SIGNATURE_LENGTH) {
    throw new Error(`Invalid signature length: expected ${SIGNATURE_LENGTH} hex chars, got ${cleanSig.length}`);
  }

  const r = cleanSig.slice(0, 64);
  const s = cleanSig.slice(64, 128);
  const vHex = cleanSig.slice(128, 130);
  const v = parseInt(vHex, 16);

  if (isNaN(v)) {
    throw new Error(`Invalid v value in signature: ${vHex}`);
  }

  return { r, s, v };
}

async function signWithPara(para: Para, hash: Hash, adjustV: boolean = true): Promise<Hash> {
  const wallet = para.getWalletsByType("EVM")[0];
  if (!wallet) {
    throw new Error("Para wallet not available for signing");
  }

  const messagePayload = hash.startsWith("0x") ? hash.substring(2) : hash;
  const messageBase64 = hexStringToBase64(messagePayload);

  const response = await para.signMessage({
    walletId: wallet.id,
    messageBase64,
  });

  if (!("signature" in response)) {
    throw new Error(`Signature failed: ${JSON.stringify(response)}`);
  }

  let signature = (response as { signature: string }).signature;

  const { v } = parseSignature(signature);

  if (adjustV && v < 27) {
    const adjustedV = (v + V_OFFSET_FOR_ETHEREUM).toString(16).padStart(2, "0");
    signature = signature.slice(0, -2) + adjustedV;
  }

  return `0x${signature}`;
}

export async function customSignMessage(para: Para, message: SignableMessage): Promise<Hash> {
  const hashedMessage = hashMessage(message);
  return signWithPara(para, hashedMessage, true);
}