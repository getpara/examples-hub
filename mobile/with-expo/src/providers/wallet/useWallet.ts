import { useContext } from "react";
import { WalletContext } from "./walletContext";
import { ethers } from "ethers";
import { Connection } from "@solana/web3.js";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { WalletType } from "@getpara/react-native-wallet";

export const useWallet = () => {
  const context = useContext(WalletContext);

  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  const { state, actions } = context;

  return {
    // Wallets with balances
    wallets: state.wallets,
    evmWallets: state.wallets[WalletType.EVM],
    solanaWallets: state.wallets[WalletType.SOLANA],

    // Refresh state
    isRefreshing: state.isRefreshing,
    lastRefreshed: state.lastRefreshed,

    // Asset prices
    prices: state.prices,
    ethUsdPrice: state.prices.ethereum?.usd,
    solUsdPrice: state.prices.solana?.usd,

    // Providers and signers
    ethereumProvider: state.ethereumProvider as ethers.JsonRpcProvider | null,
    ethereumSigner: state.ethereumSigner as ParaEthersSigner | null,
    solanaConnection: state.solanaConnection as Connection | null,
    solanaSigner: state.solanaSigner as ParaSolanaWeb3Signer | null,

    // Actions
    refreshWallets: actions.refreshWallets,
    refreshBalances: actions.refreshBalances,
    refreshPrices: actions.refreshPrices,
    initializeSigners: actions.initializeSigners,

    // Helper to check if providers and signers are initialized
    hasEthereumSigner: !!state.ethereumSigner,
    hasSolanaSigner: !!state.solanaSigner,
  };
};
