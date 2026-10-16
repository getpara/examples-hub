const SMALLEST_SHOWN_AMOUNT = 0.0001;

const DECLINED_REQUEST_PATTERN = /(denied|rejected|declined) by the user|user (denied|rejected|declined)/i;

export function shortenAddress(address: string) {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatBalance(balance: string | null, symbol: string) {
  if (balance === null) {
    return undefined;
  }

  const amount = Number(balance);

  if (!Number.isFinite(amount)) {
    return `${balance} ${symbol}`;
  }

  if (amount > 0 && amount < SMALLEST_SHOWN_AMOUNT) {
    return `<${SMALLEST_SHOWN_AMOUNT} ${symbol}`;
  }

  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol}`;
}

interface ErrorMessageOptions {
  declinedMessage?: string;
}

export function formatErrorMessage(
  message: string | null,
  { declinedMessage = "You declined the request in the Para window." }: ErrorMessageOptions = {}
) {
  const trimmed = message?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (DECLINED_REQUEST_PATTERN.test(trimmed)) {
    return declinedMessage;
  }

  const sentence = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;

  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}
