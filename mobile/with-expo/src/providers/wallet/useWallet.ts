import { useContext } from "react";
import { WalletContext } from "./walletContext";

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  const { state, actions } = context;

  return {
    wallets: state.wallets,
    evmWallets: state.wallets.EVM,
    cosmosWallets: state.wallets.COSMOS,
    solanaWallets: state.wallets.SOLANA,
    isRefreshing: state.isRefreshing,
    lastRefreshed: state.lastRefreshed,
    refreshWallets: actions.refreshWallets,
    refreshBalances: actions.refreshBalances,
  };
};
