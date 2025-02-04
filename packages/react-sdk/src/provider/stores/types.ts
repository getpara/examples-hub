import ParaWeb, { WalletType } from '@getpara/web-sdk';

export interface ClientSlice {
  client?: ParaWeb;
  setClient: (_: ParaWeb) => void;
}

export interface ModalSlice {
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
}

export interface WalletSlice {
  selectedWalletId?: string;
  selectedWalletType?: WalletType;
  setSelectedWallet: (_?: string, __?: WalletType) => void;
  clearSelectedWallet: () => void;
}

export type Store = ClientSlice & ModalSlice & WalletSlice;
