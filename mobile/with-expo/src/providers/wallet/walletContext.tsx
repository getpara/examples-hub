import React, { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import { usePara } from "../para/usePara";
import { WalletBalance } from "@/types";
import { WalletType } from "@getpara/react-native-wallet";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import { ALCHEMY_SOLANA_RPC_URL, ALCHEMY_ETHEREUM_RPC_URL } from "~/constants";

const SUPPORTED_WALLET_TYPES = [WalletType.EVM, WalletType.SOLANA] as const;

interface WalletWithBalance {
  id: string;
  address?: string;
  type?: WalletType;
  balance: WalletBalance | null;
  isLoadingBalance: boolean;
  signer: string;
  [key: string]: any;
}

interface WalletsWithBalances {
  [WalletType.EVM]: WalletWithBalance[];
  [WalletType.SOLANA]: WalletWithBalance[];
}

interface AssetPrice {
  usd: number;
  lastUpdated: Date;
}

interface AssetPrices {
  ethereum: AssetPrice | null;
  solana: AssetPrice | null;
}

interface WalletContextState {
  wallets: WalletsWithBalances;
  prices: AssetPrices;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  ethereumProvider: ethers.JsonRpcProvider | null;
  ethereumSigner: ParaEthersSigner | null;
  solanaConnection: Connection | null;
  solanaSigner: ParaSolanaWeb3Signer | null;
}

interface WalletContextActions {
  refreshWallets: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshPrices: () => Promise<void>;
  initializeSigners: () => Promise<void>;
}

export const WalletContext = createContext<
  | {
      state: WalletContextState;
      actions: WalletContextActions;
    }
  | undefined
>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

const getEthereumBalance = async (
  address: string,
  provider: ethers.JsonRpcProvider,
  retries = 0
): Promise<WalletBalance> => {
  try {
    const balance = await provider.getBalance(address);
    console.log(`Fetched ETH balance for ${address}: ${balance.toString()}`);
    return {
      amount: balance.toString(),
      symbol: "ETH",
      decimals: 18,
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying ETH balance fetch (${retries} attempts left)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getEthereumBalance(address, provider, retries - 1);
    }
    console.error("Error fetching ETH balance:", error);
    return { amount: "0", symbol: "ETH", decimals: 18 };
  }
};

const getSolanaBalance = async (address: string, connection: Connection, retries = 0): Promise<WalletBalance> => {
  try {
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    console.log(`Fetched SOL balance for ${address}: ${balance.toString()}`);
    return {
      amount: balance.toString(),
      symbol: "SOL",
      decimals: 9,
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying SOL balance fetch (${retries} attempts left)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getSolanaBalance(address, connection, retries - 1);
    }
    console.error("Error fetching SOL balance:", error);
    return { amount: "0", symbol: "SOL", decimals: 9 };
  }
};

const fetchAssetPrices = async (retries = 0): Promise<AssetPrices> => {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum,solana&vs_currencies=usd");
    console.log("Fetching asset prices from CoinGecko...");
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched asset prices:", data);

    return {
      ethereum: data.ethereum
        ? {
            usd: data.ethereum.usd,
            lastUpdated: new Date(),
          }
        : null,
      solana: data.solana
        ? {
            usd: data.solana.usd,
            lastUpdated: new Date(),
          }
        : null,
    };
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying price fetch (${retries} attempts left)...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchAssetPrices(retries - 1);
    }
    console.error("Error fetching asset prices:", error);
    return {
      ethereum: null,
      solana: null,
    };
  }
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { para, isAuthenticated } = usePara();

  const [state, setState] = useState<WalletContextState>({
    wallets: {
      [WalletType.EVM]: [],
      [WalletType.SOLANA]: [],
    },
    prices: {
      ethereum: null,
      solana: null,
    },
    isRefreshing: false,
    lastRefreshed: null,
    ethereumProvider: null,
    ethereumSigner: null,
    solanaConnection: null,
    solanaSigner: null,
  });

  const initializeSigners = useCallback(async () => {
    if (!para || !isAuthenticated) return;

    try {
      const evmWallets = para.getWalletsByType(WalletType.EVM);
      if (evmWallets.length > 0) {
        const provider = new ethers.JsonRpcProvider(ALCHEMY_ETHEREUM_RPC_URL);
        const signer = new ParaEthersSigner(para, provider);

        setState((prevState) => ({
          ...prevState,
          ethereumProvider: provider,
          ethereumSigner: signer,
        }));
      }

      const solanaWallets = para.getWalletsByType(WalletType.SOLANA);
      if (solanaWallets.length > 0) {
        const connection = new Connection(ALCHEMY_SOLANA_RPC_URL!, "confirmed");
        const signer = new ParaSolanaWeb3Signer(para, connection);

        setState((prevState) => ({
          ...prevState,
          solanaConnection: connection,
          solanaSigner: signer,
        }));
      }
    } catch (error) {
      console.error("Error initializing signers:", error);
    }
  }, [para, isAuthenticated]);

  const refreshPrices = useCallback(async () => {
    try {
      const prices = await fetchAssetPrices();
      setState((prevState) => ({
        ...prevState,
        prices,
      }));
    } catch (error) {
      console.error("Error refreshing prices:", error);
    }
  }, []);

  const refreshWallets = useCallback(async () => {
    if (!para || !isAuthenticated) return;

    setState((prevState) => ({ ...prevState, isRefreshing: true }));

    try {
      const evmWallets = para.getWalletsByType(WalletType.EVM).map((wallet) => ({
        ...wallet,
        type: WalletType.EVM,
        balance: null,
        isLoadingBalance: true,
      }));

      const solanaWallets = para.getWalletsByType(WalletType.SOLANA).map((wallet) => ({
        ...wallet,
        type: WalletType.SOLANA,
        balance: null,
        isLoadingBalance: true,
      }));

      const wallets: WalletsWithBalances = {
        [WalletType.EVM]: evmWallets,
        [WalletType.SOLANA]: solanaWallets,
      };

      setState((prevState) => ({
        ...prevState,
        wallets,
      }));

      await initializeSigners();

      await Promise.all([refreshBalances(), refreshPrices()]);

      setState((prevState) => ({
        ...prevState,
        isRefreshing: false,
        lastRefreshed: new Date(),
      }));
    } catch (error) {
      console.error("Error refreshing wallets:", error);
      setState((prevState) => ({ ...prevState, isRefreshing: false }));
    }
  }, [para, isAuthenticated, initializeSigners, refreshPrices]);

  const refreshBalances = useCallback(async () => {
    if (!para || !isAuthenticated) return;

    setState((prevState) => {
      const updatedWallets = { ...prevState.wallets };

      SUPPORTED_WALLET_TYPES.forEach((type) => {
        updatedWallets[type] = prevState.wallets[type].map((wallet) => ({
          ...wallet,
          isLoadingBalance: true,
        }));
      });

      return { ...prevState, wallets: updatedWallets };
    });

    try {
      setState((prevState) => {
        const balancePromises: Promise<void>[] = [];

        if (prevState.ethereumProvider) {
          prevState.wallets[WalletType.EVM].forEach((wallet, index) => {
            if (!wallet.address) {
              setState((latest) => {
                const updatedWallets = { ...latest.wallets };
                updatedWallets[WalletType.EVM] = [...latest.wallets[WalletType.EVM]];
                updatedWallets[WalletType.EVM][index] = {
                  ...updatedWallets[WalletType.EVM][index],
                  isLoadingBalance: false,
                };
                return { ...latest, wallets: updatedWallets };
              });
              return;
            }

            const promise = getEthereumBalance(wallet.address, prevState.ethereumProvider!).then((balance) => {
              setState((latest) => {
                const updatedWallets = { ...latest.wallets };
                if (updatedWallets[WalletType.EVM] && updatedWallets[WalletType.EVM][index]) {
                  updatedWallets[WalletType.EVM] = [...latest.wallets[WalletType.EVM]];
                  updatedWallets[WalletType.EVM][index] = {
                    ...updatedWallets[WalletType.EVM][index],
                    balance,
                    isLoadingBalance: false,
                  };
                }
                return { ...latest, wallets: updatedWallets };
              });
            });
            balancePromises.push(promise);
          });
        }

        if (prevState.solanaConnection) {
          prevState.wallets[WalletType.SOLANA].forEach((wallet, index) => {
            if (!wallet.address) {
              setState((latest) => {
                const updatedWallets = { ...latest.wallets };
                updatedWallets[WalletType.SOLANA] = [...latest.wallets[WalletType.SOLANA]];
                updatedWallets[WalletType.SOLANA][index] = {
                  ...updatedWallets[WalletType.SOLANA][index],
                  isLoadingBalance: false,
                };
                return { ...latest, wallets: updatedWallets };
              });
              return;
            }

            const promise = getSolanaBalance(wallet.address, prevState.solanaConnection!).then((balance) => {
              setState((latest) => {
                const updatedWallets = { ...latest.wallets };
                if (updatedWallets[WalletType.SOLANA] && updatedWallets[WalletType.SOLANA][index]) {
                  updatedWallets[WalletType.SOLANA] = [...latest.wallets[WalletType.SOLANA]];
                  updatedWallets[WalletType.SOLANA][index] = {
                    ...updatedWallets[WalletType.SOLANA][index],
                    balance,
                    isLoadingBalance: false,
                  };
                }
                return { ...latest, wallets: updatedWallets };
              });
            });
            balancePromises.push(promise);
          });
        }

        return prevState;
      });
    } catch (error) {
      console.error("Error refreshing balances:", error);
      setState((prevState) => {
        const updatedWallets = { ...prevState.wallets };

        SUPPORTED_WALLET_TYPES.forEach((type) => {
          updatedWallets[type] = prevState.wallets[type].map((wallet: WalletWithBalance) => ({
            ...wallet,
            isLoadingBalance: false,
          }));
        });

        return { ...prevState, wallets: updatedWallets };
      });
    }
  }, [para, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallets();
    }
  }, [isAuthenticated, refreshWallets]);

  useEffect(() => {
    if (isAuthenticated) {
      const refreshInterval = setInterval(() => {
        refreshPrices();
        refreshBalances();
      }, 1 * 60 * 1000);

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, refreshPrices, refreshBalances]);

  const actions: WalletContextActions = {
    refreshWallets,
    refreshBalances,
    refreshPrices,
    initializeSigners,
  };

  return <WalletContext.Provider value={{ state, actions }}>{children}</WalletContext.Provider>;
};
