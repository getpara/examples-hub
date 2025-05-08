import React, { createContext, useEffect, useState, ReactNode, useCallback } from "react";
import { usePara } from "../para/usePara";
import { WalletBalance, WalletsWithBalances } from "@/types";
import { WalletType } from "@getpara/react-native-wallet";

interface WalletContextState {
  wallets: WalletsWithBalances;
  isRefreshing: boolean;
  lastRefreshed: Date | null;
}

interface WalletContextActions {
  refreshWallets: () => Promise<void>;
  refreshBalances: () => Promise<void>;
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

const getWalletBalance = async (walletType: WalletType): Promise<WalletBalance> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockBalances = {
    [WalletType.EVM]: { amount: "1234567890000000000", symbol: "ETH", decimals: 18 },
    [WalletType.COSMOS]: { amount: "1000000", symbol: "ATOM", decimals: 6 },
    [WalletType.SOLANA]: { amount: "1000000000", symbol: "SOL", decimals: 9 },
  };

  return mockBalances[walletType] || { amount: "0", symbol: "UNKNOWN", decimals: 0 };
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const { para, isAuthenticated } = usePara();

  const [state, setState] = useState<WalletContextState>({
    wallets: {
      [WalletType.EVM]: [],
      [WalletType.COSMOS]: [],
      [WalletType.SOLANA]: [],
    },
    isRefreshing: false,
    lastRefreshed: null,
  });

  const refreshWallets = useCallback(async () => {
    if (!para || !isAuthenticated) return;

    setState((prevState) => ({ ...prevState, isRefreshing: true }));

    try {
      const wallets: WalletsWithBalances = {
        [WalletType.EVM]: para.getWalletsByType(WalletType.EVM).map((wallet) => ({
          ...wallet,
          balance: null,
          isLoadingBalance: true,
        })),
        [WalletType.COSMOS]: para.getWalletsByType(WalletType.COSMOS).map((wallet) => ({
          ...wallet,
          balance: null,
          isLoadingBalance: true,
        })),
        [WalletType.SOLANA]: para.getWalletsByType(WalletType.SOLANA).map((wallet) => ({
          ...wallet,
          balance: null,
          isLoadingBalance: true,
        })),
      };

      setState((prevState) => ({
        ...prevState,
        wallets,
      }));

      await refreshBalances();

      setState((prevState) => ({
        ...prevState,
        isRefreshing: false,
        lastRefreshed: new Date(),
      }));
    } catch (error) {
      console.error("Error refreshing wallets:", error);
      setState((prevState) => ({ ...prevState, isRefreshing: false }));
    }
  }, [para, isAuthenticated]);

  const refreshBalances = useCallback(async () => {
    if (!para || !isAuthenticated) return;

    setState((prevState) => {
      const updatedWallets = { ...prevState.wallets };

      Object.values(WalletType).forEach((type) => {
        updatedWallets[type] = prevState.wallets[type].map((wallet) => ({
          ...wallet,
          isLoadingBalance: true,
        }));
      });

      return { ...prevState, wallets: updatedWallets };
    });

    try {
      const balancePromises: Promise<void>[] = [];

      Object.values(WalletType).forEach((type) => {
        state.wallets[type].forEach((wallet, index) => {
          const promise = getWalletBalance(type).then((balance) => {
            setState((prevState) => {
              const updatedWallets = { ...prevState.wallets };
              updatedWallets[type] = [...prevState.wallets[type]];
              updatedWallets[type][index] = {
                ...updatedWallets[type][index],
                balance,
                isLoadingBalance: false,
              };
              return { ...prevState, wallets: updatedWallets };
            });
          });
          balancePromises.push(promise);
        });
      });

      await Promise.all(balancePromises);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    }
  }, [para, isAuthenticated, state.wallets]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallets();
    }
  }, [isAuthenticated]);

  const actions: WalletContextActions = {
    refreshWallets,
    refreshBalances,
  };

  return <WalletContext.Provider value={{ state, actions }}>{children}</WalletContext.Provider>;
};
