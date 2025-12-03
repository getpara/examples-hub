import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AssetValue,
  BroadcastTransactionResult,
  EstimateTransactionOpts,
  EstimateTransactionResult,
  ProfileBalance,
  TransactionType,
  TWalletType,
  WalletBalance,
} from '@getpara/shared';
import { useInternalClient } from '../../../../provider/hooks/utils/useInternalClient.js';
import { useProfileBalance, useSignMessage, useSignTransaction, useWalletState } from '../../../../provider/index.js';
import { hexStringToBase64, SuccessfulSignatureRes } from '@getpara/web-sdk';
import { useModalStore } from '../../../stores/index.js';
import { ModalStep } from '../../../utils/steps.js';
import { useStore } from '../../../../provider/stores/useStore.js';

export type SendStep = 'SEND_FORM' | 'SEND_ASSET' | 'SEND_NETWORK';

type SendMetadata = {
  asset: WalletBalance['assets'][number] | null;
  network: WalletBalance['assets'][number]['networks'][number] | null;
};

type OptionsType = 'MULTIPLE' | 'SINGLE_ASSET' | 'SINGLE_NETWORK' | 'NONE';

type BroadcastOpts = {
  userId: string;
  walletId: string;
  walletAddress: string;
  walletType: TransactionType;
  txSerialized: string;
  message?: string;
  evmChainId?: string;
  isDevnet?: boolean;
};

type Value = {
  step: SendStep;
  sendMetadata: SendMetadata;
  setSendMetadata: Dispatch<SetStateAction<SendMetadata>>;
  assetPrice: AssetValue | null;
  assetValueOnNetwork: AssetValue | null;
  assetAmountOnNetwork: number;
  destinationAddress: string;
  setDestinationAddress: Dispatch<SetStateAction<string>>;
  transferValue: number;
  setTransferValue: Dispatch<SetStateAction<number>>;
  transferAmount: number;
  setTransferAmount: Dispatch<SetStateAction<number>>;
  estimate: EstimateTransactionResult | null;
  isMax: boolean;
  setIsMax: Dispatch<SetStateAction<boolean>>;
  estimateIsPending: boolean;
  estimateIsError: boolean;
  onSubmit: () => void;
  broadcast: BroadcastTransactionResult | null;
  broadcastIsPending: boolean;
  broadcastIsError: boolean;
  optionsType: OptionsType;
};

const getDefaultSendMetadata = (
  balances?: ProfileBalance | null,
  wallet?: { type?: TWalletType; address?: string } | null,
) => {
  if (!balances || !wallet?.type || !wallet?.address || wallet?.type === 'COSMOS') {
    return { asset: null, network: null };
  }
  const walletBalance = balances.wallets.find(({ address }) => address === wallet?.address);
  if (!walletBalance) {
    return { asset: null, network: null };
  }
  const defaultAsset = walletBalance.assets.find(
    ({ metadata }) => metadata?.symbol === (wallet?.type === 'EVM' ? 'ETH' : 'SOL'),
  );
  if (!defaultAsset) {
    return { asset: null, network: null };
  }
  const defaultNetwork = defaultAsset.networks[0] || null;
  return { asset: defaultAsset, network: defaultNetwork };
};

const getTransferAmount = (sendMetadata: SendMetadata, transferValue: number) => {
  const isPriced = sendMetadata?.asset?.metadata?.price !== undefined && sendMetadata?.asset?.metadata?.price?.value > 0;

  if (isPriced) {
    return transferValue / sendMetadata!.asset!.metadata!.price!.value!;
  }

  return 0;
};

const getTransferValue = (sendMetadata: SendMetadata, transferAmount: number) => {
  const isPriced = sendMetadata?.asset?.metadata?.price !== undefined && sendMetadata?.asset?.metadata?.price?.value > 0;
  if (isPriced) {
    return transferAmount * sendMetadata!.asset!.metadata!.price!.value!;
  }
  return 0;
};

export const AccountSendContext = createContext<Value>({} as Value);

export function AccountSendProvider({ children, step }: PropsWithChildren<{ step: SendStep }>) {
  const para = useInternalClient();
  const setStep = useModalStore(state => state.setStep);
  const setSendTx = useModalStore(state => state.setSendTx);
  const { data: balances } = useProfileBalance({ isComprehensive: true });
  const { signTransactionAsync } = useSignTransaction();
  const { signMessageAsync } = useSignMessage();
  const { selectedWallet, setSelectedWallet } = useWalletState();
  const [estimate, setEstimate] = useState<EstimateTransactionResult | null>(null);
  const [broadcast, setBroadcast] = useState<BroadcastTransactionResult | null>(null);
  const [sendMetadata, setSendMetadata] = useState<SendMetadata>(() => getDefaultSendMetadata(balances, selectedWallet));
  const [destinationAddress, setDestinationAddress] = useState('');
  const [transferValue, setTransferValue] = useState<number>(0);
  const [transferAmount, setTransferAmount] = useState<number>(getTransferAmount(sendMetadata, transferValue));
  const [isMax, setIsMax] = useState(false);

  const optionsType: OptionsType = useMemo(() => {
    const walletBalance = balances?.wallets.find(({ address }) => address === selectedWallet?.address);

    if (!walletBalance || walletBalance.assets.length === 0) {
      return 'NONE';
    }

    if (walletBalance?.assets.length === 1) {
      return walletBalance.assets[0].networks.length === 1 ? 'SINGLE_NETWORK' : 'SINGLE_ASSET';
    }

    return 'MULTIPLE';
  }, [balances, selectedWallet?.address]);

  const {
    mutate: estimateMutate,
    isPending: estimateIsPending,
    isError: estimateIsError,
  } = useMutation({
    mutationKey: ['estimate-tx'],
    mutationFn: async ({ userId, walletId, opts }: { userId: string; walletId: string; opts: EstimateTransactionOpts }) => {
      if (!para.userId || !selectedWallet.id) {
        return null;
      }

      const result = await para.ctx.client.estimateSendTransaction({
        userId,
        walletId,
        opts,
      });

      return result;
    },
    onSuccess: data => {
      setEstimate(data);
    },
    onError: error => {
      console.error(error);
    },
  });

  const queryClient = useQueryClient();
  const refs = useStore(state => state.refs);

  const {
    mutate: broadcastMutate,
    isPending: broadcastIsPending,
    isError: broadcastIsError,
  } = useMutation({
    mutationKey: ['broadcast-tx'],
    mutationFn: async ({
      userId,
      walletId,
      walletAddress,
      walletType,
      txSerialized,
      message,
      evmChainId,
      isDevnet,
    }: BroadcastOpts) => {
      if (!para.userId || !selectedWallet.id) {
        return null;
      }

      let signature;
      switch (walletType) {
        case 'SOLANA':
          signature = (
            (await signMessageAsync({
              walletId,
              messageBase64: message!,
            })) as SuccessfulSignatureRes
          )?.signature;
          break;
        case 'EVM':
        default:
          signature = (
            (await signTransactionAsync({
              walletId,
              rlpEncodedTxBase64: hexStringToBase64(txSerialized),
              chainId: evmChainId!,
            })) as SuccessfulSignatureRes
          )?.signature;
          if (!!signature) {
            signature = `0x${signature}`;
          }
          break;
      }

      const result = await para.ctx.client.broadcastSendTransaction({
        userId,
        walletId,
        opts: {
          type: walletType,
          evmChainId,
          isDevnet,
          tx: txSerialized,
          signature,
          sourceAddress: walletAddress,
          txUrlFormat: sendMetadata?.network?.metadata?.explorer?.txUrlFormat,
        },
      });

      return result;
    },
    onSuccess: data => {
      if (!!data?.error) {
        setBroadcast(data);
      } else if (!!data) {
        setSendTx(data);
        setStep(ModalStep.ACCOUNT_MAIN);
        // Trigger balance refetch after successful transaction broadcast
        refs.balancesInvalidationTime.current = Date.now();
        queryClient.invalidateQueries({
          queryKey: ['useProfileBalance'],
          refetchType: 'active',
        });
      }
    },
    onError: error => {
      console.error(error);
    },
  });

  const onSubmit = useCallback(() => {
    broadcastMutate({
      userId: para.userId!,
      walletId: selectedWallet.id!,
      walletAddress: selectedWallet.address!,
      walletType: selectedWallet.type! as TransactionType,
      txSerialized: estimate?.result?.txSerialized!,
      message: estimate?.result?.message,
      evmChainId: sendMetadata?.network?.metadata?.evmChainId,
      isDevnet: sendMetadata?.network?.metadata?.internalId === 'SOLANA_DEVNET',
    });
  }, [
    para.userId,
    selectedWallet.id,
    selectedWallet.address,
    selectedWallet.type,
    estimate?.result?.txSerialized,
    estimate?.result?.message,
    sendMetadata?.network?.metadata?.evmChainId,
    sendMetadata?.network?.metadata?.internalId,
  ]);

  const availableWallets = useMemo(() => {
    return para.availableWallets.filter(({ type }) => type !== 'COSMOS');
  }, [para.availableWallets]);

  const { assetPrice, assetValueOnNetwork, assetAmountOnNetwork } = useMemo(() => {
    const assetAmountOnNetwork = sendMetadata.network?.quantity || 0;

    if (sendMetadata.asset?.metadata?.price && sendMetadata.asset?.metadata?.price?.value > 0) {
      return {
        assetPrice: sendMetadata.asset.metadata.price,
        assetValueOnNetwork: sendMetadata.network?.value || null,
        assetAmountOnNetwork,
      };
    }
    return {
      assetPrice: null,
      assetValueOnNetwork: null,
      assetAmountOnNetwork,
    };
  }, [sendMetadata.asset, sendMetadata.network]);

  useEffect(() => {
    if (availableWallets.length > 0 && selectedWallet.type === 'COSMOS') {
      const defaultWallet = availableWallets.find(wallet => wallet.type !== 'EVM');
      defaultWallet?.id && defaultWallet?.type && setSelectedWallet(defaultWallet);
    }
  }, [availableWallets, selectedWallet.type, setSelectedWallet]);

  // Track the source of the last update to prevent circular updates
  const updateSourceRef = useRef<'value' | 'amount' | null>(null);
  const prevSendMetadataRef = useRef(sendMetadata);
  const prevWalletAddressRef = useRef(selectedWallet?.address);
  const isSettingMaxRef = useRef(false);
  const isResettingRef = useRef(false);

  const resetState = useCallback(() => {
    if (isResettingRef.current) {
      return; // Prevent multiple resets
    }
    isResettingRef.current = true;
    updateSourceRef.current = 'value';
    // Reset both values to 0 when asset/network changes
    setDestinationAddress('');
    setTransferValue(0);
    setTransferAmount(0);
    setIsMax(false);
    // Clear the estimate since it's no longer valid for the new asset/network
    setEstimate(null);

    // Clear the flags after state updates complete
    setTimeout(() => {
      isResettingRef.current = false;
      updateSourceRef.current = null;
    }, 0);
  }, []);

  // Reset everything when wallet address changes
  useEffect(() => {
    const walletAddressChanged = prevWalletAddressRef.current !== selectedWallet?.address;
    if (walletAddressChanged) {
      prevWalletAddressRef.current = selectedWallet?.address;
      // Reset sendMetadata to default for the new wallet
      const newSendMetadata = getDefaultSendMetadata(
        balances || null,
        selectedWallet ? { type: selectedWallet.type! as 'EVM' | 'SOLANA', address: selectedWallet.address } : null,
      );
      setSendMetadata(newSendMetadata);
      // Reset all other state
      resetState();
    }
  }, [selectedWallet?.address, balances, resetState]);

  // Reset transfer amounts and clear estimate when sendMetadata changes
  // (but not when it changes due to wallet address change, which is handled above)
  useEffect(() => {
    // Use deep comparison to avoid unnecessary resets when object reference changes but values are the same
    const sendMetadataChanged =
      prevSendMetadataRef.current?.asset !== sendMetadata?.asset ||
      prevSendMetadataRef.current?.network !== sendMetadata?.network;
    const walletAddressChanged = prevWalletAddressRef.current !== selectedWallet?.address;

    if (sendMetadataChanged && !walletAddressChanged && !isResettingRef.current) {
      prevSendMetadataRef.current = sendMetadata;
      // Set flag to prevent other effects from interfering during reset
      resetState();
    } else if (sendMetadataChanged) {
      // Just update the ref if sendMetadata changed due to wallet address change
      prevSendMetadataRef.current = sendMetadata;
    }
  }, [sendMetadata, selectedWallet?.address, resetState]);

  useEffect(() => {
    if (step !== 'SEND_FORM' || sendMetadata.network) {
      return;
    }

    if (sendMetadata.asset && sendMetadata.asset.networks.length > 0) {
      setSendMetadata(prev => ({
        ...prev,
        network: prev.asset!.networks[0],
      }));
      return;
    }

    // Only update if the default metadata is actually different
    // This prevents infinite loops when there are no assets
    const defaultMetadata = getDefaultSendMetadata(balances, selectedWallet);
    if (defaultMetadata.asset !== sendMetadata.asset || defaultMetadata.network !== sendMetadata.network) {
      setSendMetadata(defaultMetadata);
    }
  }, [step, sendMetadata.asset, sendMetadata.network, balances, selectedWallet]);

  useEffect(() => {
    // Skip if we're resetting or setting max
    if (isResettingRef.current || isSettingMaxRef.current) {
      return;
    }
    // Only update transferAmount if transferValue changed (but not if we just updated from amount)
    if (updateSourceRef.current !== 'amount') {
      updateSourceRef.current = 'value';
      setTransferAmount(getTransferAmount(sendMetadata, transferValue));
      // Clear the flag after state update completes
      setTimeout(() => {
        updateSourceRef.current = null;
      }, 0);
    }
  }, [transferValue, sendMetadata]);

  useEffect(() => {
    // Skip if we're resetting or setting max
    if (isResettingRef.current || isSettingMaxRef.current) {
      return;
    }
    // Only update transferValue if transferAmount changed from user input (not from our calculation)
    // Skip if we just updated from value
    if (updateSourceRef.current !== 'value') {
      updateSourceRef.current = 'amount';
      const newValue = getTransferValue(sendMetadata, transferAmount);
      // Use functional update to avoid dependency on transferValue
      setTransferValue(prevValue => {
        if (newValue !== prevValue) {
          return newValue;
        }
        return prevValue;
      });
      // Clear the flag after state update completes
      setTimeout(() => {
        updateSourceRef.current = null;
      }, 0);
    }
  }, [transferAmount, sendMetadata]);

  useEffect(() => {
    // Skip if we're resetting - isMax is already set to false in the reset effect
    if (isResettingRef.current) {
      return;
    }
    // Only set isMax to false if transferAmount changed from user input (not from setting max)
    if (!isSettingMaxRef.current && transferAmount !== assetAmountOnNetwork) {
      setIsMax(false);
    }
  }, [transferAmount, assetAmountOnNetwork]);

  useEffect(() => {
    // Skip if we're resetting state
    if (isResettingRef.current) {
      return;
    }

    const isSendMax = isMax && assetAmountOnNetwork > 0;
    // Clear estimate if transaction becomes invalid
    if (!destinationAddress || destinationAddress.length === 0 || (!isSendMax && transferAmount <= 0)) {
      // Clear estimate when transaction is invalid to disable the button
      setEstimate(null);
      return;
    }

    estimateMutate({
      walletId: selectedWallet.id!,
      userId: para.userId!,
      opts: {
        type: selectedWallet.type === 'COSMOS' ? 'EVM' : selectedWallet.type!,
        sourceAddress: selectedWallet.address!,
        destinationAddress,
        contractAddress: sendMetadata?.network?.contractAddress,
        transferAmount: isMax && assetAmountOnNetwork ? assetAmountOnNetwork : transferAmount,
        evmChainId: sendMetadata?.network?.metadata?.evmChainId,
        isDevnet: selectedWallet.type === 'SOLANA' && sendMetadata?.network?.metadata?.internalId === 'SOLANA_DEVNET',
        tokenSymbol: sendMetadata?.asset?.metadata?.symbol,
      },
    });
  }, [
    transferAmount,
    destinationAddress,
    selectedWallet.address,
    selectedWallet.type,
    selectedWallet.id,
    sendMetadata?.asset,
    sendMetadata?.network,
    para.userId,
    assetAmountOnNetwork,
    isMax,
  ]);

  const value = useMemo(() => {
    return {
      step,
      sendMetadata,
      setSendMetadata,
      destinationAddress,
      setDestinationAddress,
      transferValue,
      setTransferValue,
      transferAmount,
      setTransferAmount,
      assetPrice,
      assetValueOnNetwork,
      assetAmountOnNetwork,
      estimate,
      isMax,
      setIsMax,
      onSubmit,
      estimateIsPending,
      estimateIsError,
      broadcast,
      broadcastIsPending,
      broadcastIsError,
      optionsType,
    };
  }, [
    step,
    sendMetadata,
    setSendMetadata,
    destinationAddress,
    setDestinationAddress,
    transferValue,
    setTransferValue,
    transferAmount,
    setTransferAmount,
    assetPrice,
    assetValueOnNetwork,
    assetAmountOnNetwork,
    estimate,
    isMax,
    setIsMax,
    onSubmit,
    estimateIsPending,
    estimateIsError,
    broadcast,
    broadcastIsPending,
    broadcastIsError,
    optionsType,
  ]);

  return <AccountSendContext.Provider value={value}>{children}</AccountSendContext.Provider>;
}

export const useSend = () => useContext(AccountSendContext);
