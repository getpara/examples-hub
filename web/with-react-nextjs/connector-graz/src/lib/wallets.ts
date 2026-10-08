const WALLET_NAMES: Record<string, string> = {
  para: "Para",
  keplr: "Keplr",
  leap: "Leap",
  cosmostation: "Cosmostation",
  walletconnect: "WalletConnect",
};

const WALLET_ORDER = ["para", "keplr", "leap", "cosmostation"];

const BROWSER_EXTENSIONS = ["keplr", "leap", "cosmostation"];

function walletRank(walletId: string) {
  const rank = WALLET_ORDER.indexOf(walletId);
  return rank === -1 ? WALLET_ORDER.length : rank;
}

export function walletName(walletId: string) {
  return (
    WALLET_NAMES[walletId] ??
    walletId
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function walletDescription(walletId: string) {
  return BROWSER_EXTENSIONS.includes(walletId) ? "Browser extension" : "Detected in this browser";
}

export function compareWallets(first: string, second: string) {
  return walletRank(first) - walletRank(second);
}
