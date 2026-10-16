import { isAddress, isHash, parseAbi, type Address, type Hash } from "viem";
import { arcPublicClient } from "@/lib/publicClients";
import { formatUsdc } from "@/lib/tokens";

const IRIS_API_URL = "https://iris-api.circle.com";
const BASE_CCTP_DOMAIN = 6;
const ARC_CCTP_DOMAIN = "26";
const ARC_MESSAGE_TRANSMITTER = "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64";
const MESSAGE_TRANSMITTER_ABI = parseAbi(["function usedNonces(bytes32 nonce) view returns (uint256)"]);
const BASE_UNIT_PATTERN = /^\d+$/;

interface IrisMessageBody {
  amount?: string;
  mintRecipient?: string;
}

interface IrisDecodedMessage {
  destinationDomain?: string;
  decodedMessageBody?: IrisMessageBody | null;
}

interface IrisMessage {
  status?: string;
  eventNonce?: string | null;
  decodedMessage?: IrisDecodedMessage | null;
  forwardTxHash?: string | null;
}

interface IrisMessagesResponse {
  messages?: IrisMessage[];
}

export interface TransferStatus {
  burnTxHash: Hash;
  circleStatus: string;
  nonce: Hash | null;
  amount: string | null;
  recipient: Address | null;
  isArcDestination: boolean;
  isMinted: boolean;
  forwardTxHash: Hash | null;
}

export type TransferLookup = { isFound: false; burnTxHash: Hash } | { isFound: true; transfer: TransferStatus };

async function fetchIrisMessage(burnTxHash: Hash) {
  const url = `${IRIS_API_URL}/v2/messages/${BASE_CCTP_DOMAIN}?transactionHash=${burnTxHash}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Circle's attestation service returned HTTP ${response.status}.`);
  }

  const body: IrisMessagesResponse = await response.json();
  return body.messages?.[0] ?? null;
}

async function isNonceUsedOnArc(nonce: Hash) {
  const usedAt = await arcPublicClient.readContract({
    address: ARC_MESSAGE_TRANSMITTER,
    abi: MESSAGE_TRANSMITTER_ABI,
    functionName: "usedNonces",
    args: [nonce],
  });

  return usedAt > BigInt(0);
}

function readAmount(body: IrisMessageBody | null | undefined) {
  const amount = body?.amount;
  return amount && BASE_UNIT_PATTERN.test(amount) ? formatUsdc(BigInt(amount)) : null;
}

function readRecipient(body: IrisMessageBody | null | undefined) {
  const recipient = body?.mintRecipient;
  return recipient && isAddress(recipient) ? recipient : null;
}

function readHash(value: string | null | undefined) {
  return value && isHash(value) ? value : null;
}

export function parseBurnTxHash(input: string) {
  return readHash(input.trim());
}

export async function fetchTransferStatus(burnTxHash: Hash): Promise<TransferLookup> {
  const message = await fetchIrisMessage(burnTxHash);

  if (!message) {
    return { isFound: false, burnTxHash };
  }

  const nonce = readHash(message.eventNonce);
  const isArcDestination = message.decodedMessage?.destinationDomain === ARC_CCTP_DOMAIN;
  const isMinted = nonce !== null && isArcDestination ? await isNonceUsedOnArc(nonce) : false;

  return {
    isFound: true,
    transfer: {
      burnTxHash,
      circleStatus: message.status ?? "unknown",
      nonce,
      amount: readAmount(message.decodedMessage?.decodedMessageBody),
      recipient: readRecipient(message.decodedMessage?.decodedMessageBody),
      isArcDestination,
      isMinted,
      forwardTxHash: readHash(message.forwardTxHash),
    },
  };
}
