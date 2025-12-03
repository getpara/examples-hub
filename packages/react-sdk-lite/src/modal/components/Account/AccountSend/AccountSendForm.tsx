import { CpslButton, CpslIcon, CpslInput, CpslText } from '@getpara/react-components';
import { QuantityInput } from '../../QuantityInput.js';
import { formatAssetQuantity, formatCurrency } from '@getpara/shared';
import { WalletTypeIcon } from '@getpara/react-common';
import { useSend } from './context.js';
import { useModalStore } from '../../../stores/index.js';
import { ModalStep } from '../../../utils/steps.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce.js';
import { AssetNetwork } from './AssetNetwork.js';
import { useWalletState } from '../../../../provider/index.js';

export function AccountSendForm() {
  const { selectedWallet } = useWalletState();
  const setStep = useModalStore(state => state.setStep);
  const onRampConfig = useModalStore(state => state.onRampConfig);
  const {
    estimate,
    broadcast,
    onSubmit,
    sendMetadata,
    destinationAddress,
    setDestinationAddress,
    transferValue,
    setTransferValue,
    transferAmount,
    setTransferAmount,
    assetPrice,
    assetValueOnNetwork,
    assetAmountOnNetwork,
    isMax,
    setIsMax,
    estimateIsPending,
    broadcastIsPending,
    optionsType,
  } = useSend();

  const [inputDestinationAddress, setInputDestinationAddress] = useState(destinationAddress);
  const dbInputDestinationAddress = useDebounce(inputDestinationAddress, 500);
  // Force AMOUNT mode if asset has price but network is testnet
  const isTestnet = sendMetadata?.network?.metadata?.isTestnet;
  const shouldUseAmountMode = !assetPrice || (!!assetPrice && isTestnet);
  const [inputMode, setInputMode] = useState<'VALUE' | 'AMOUNT'>(shouldUseAmountMode ? 'AMOUNT' : 'VALUE');
  const [inputValue, setInputValue] = useState<string>(
    inputMode === 'VALUE' ? transferValue.toFixed(2) : formatAssetQuantity({ quantity: transferAmount, symbol: '' }),
  );
  const dbInputValue = useDebounce(inputValue, 500);
  const isEditing = useRef(false);

  const error = useMemo(() => {
    const errorRef = estimate?.error || broadcast?.error;
    // Show error if it exists and there's no successful result
    // The error represents the state of the last completed estimation
    if (!errorRef || estimateIsPending || broadcastIsPending) {
      return null;
    }
    switch (errorRef?.code) {
      case 'INSUFFICIENT_NATIVE_BALANCE': {
        const nativeSymbol = selectedWallet?.type === 'EVM' ? 'ETH' : 'SOL';
        return (
          <>
            <CpslText variant="bodyXS" color="error" style={{ textAlign: onRampConfig?.isBuyEnabled ? 'left' : 'center' }}>
              You need {estimate?.transferAmount ?? nativeSymbol} to conduct this transaction
            </CpslText>
            {onRampConfig?.isBuyEnabled && (
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--cpsl-color-text-contrast)',
                  fontSize: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  paddingRight: 0,
                }}
                onClick={() => setStep(ModalStep.ADD_FUNDS_BUY)}
              >
                <span>Buy {nativeSymbol}</span>
                <CpslIcon icon="chevronRight" size="12px" color="var(--cpsl-color-text-contrast)" />
              </button>
            )}
          </>
        );
      }

      default: {
        return (
          <CpslText variant="bodyXS" color="error" style={{ textAlign: 'center', width: '100%' }}>
            {errorRef?.message}
          </CpslText>
        );
      }
    }
  }, [
    broadcast?.error,
    estimate?.error,
    selectedWallet?.type,
    estimateIsPending,
    broadcastIsPending,
    onRampConfig?.isBuyEnabled,
  ]);

  useEffect(() => {
    // Force AMOUNT mode if asset has price but network is testnet
    const isTestnet = sendMetadata?.network?.metadata?.isTestnet;
    const shouldUseAmountMode = !assetPrice || (!!assetPrice && isTestnet);
    setInputMode(shouldUseAmountMode ? 'AMOUNT' : 'VALUE');
  }, [assetPrice, sendMetadata?.network?.metadata?.isTestnet]);

  useEffect(() => {
    if (inputMode === 'AMOUNT') {
      setTransferAmount(Number(dbInputValue));
    } else {
      setTransferValue(Number(dbInputValue));
    }
  }, [dbInputValue]);

  useEffect(() => {
    setDestinationAddress(dbInputDestinationAddress);
  }, [dbInputDestinationAddress]);

  useEffect(() => {
    if (inputMode === 'VALUE' && !isEditing.current) {
      const numValue = parseFloat(inputValue || '0');
      const formattedValue = transferValue.toFixed(2);
      // Only update if the numeric value differs or if formatting differs (e.g., 9.7 vs 9.70)
      if (Math.abs(numValue - transferValue) > 0.001 || inputValue !== formattedValue) {
        setInputValue(formattedValue);
      }
    }
  }, [transferValue, inputMode, inputValue]);

  useEffect(() => {
    if (inputMode === 'AMOUNT' && !isEditing.current && Number(inputValue) !== transferAmount) {
      setInputValue(formatAssetQuantity({ quantity: transferAmount, symbol: '' }));
    }
  }, [transferAmount]);

  useEffect(() => {
    setInputDestinationAddress(destinationAddress);
  }, [destinationAddress]);

  return (
    <div style={{ display: 'flex', width: '100%', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          background: 'var(--cpsl-color-background-4)',
          borderRadius: 'var(--cpsl-border-radius-input)',
          padding: '32px 16px 16px',
          flexDirection: 'column',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', width: '100%', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
          <QuantityInput
            value={
              inputMode === 'VALUE'
                ? isMax && !!assetValueOnNetwork
                  ? assetValueOnNetwork.value.toFixed(2)
                  : inputValue
                : isMax && !!assetAmountOnNetwork
                  ? formatAssetQuantity({ quantity: assetAmountOnNetwork, symbol: '' })
                  : inputValue
            }
            onChange={value => {
              setIsMax(false);
              setInputValue(value ?? '');
            }}
            onFocus={() => (isEditing.current = true)}
            onBlur={() => {
              isEditing.current = false;
              // Format the value with 2 decimal places when in VALUE mode to preserve trailing zeros
              // This ensures values like 9.70 stay as 9.70 instead of becoming 9.7
              if (inputMode === 'VALUE' && inputValue) {
                const numValue = parseFloat(inputValue);
                if (!isNaN(numValue)) {
                  const formatted = numValue.toFixed(2);
                  // Only update if the formatted value is different (preserves user's trailing zeros)
                  if (inputValue !== formatted) {
                    setInputValue(formatted);
                  }
                }
              }
            }}
            symbol={inputMode === 'VALUE' ? '$' : undefined}
            size="56px"
          />
          {!!assetPrice && assetPrice.value > 0 && !isTestnet && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
              onClick={() => setInputMode(prev => (prev === 'VALUE' ? 'AMOUNT' : 'VALUE'))}
            >
              <CpslText variant="bodyM" color="secondary">
                {inputMode === 'VALUE'
                  ? formatAssetQuantity({
                      quantity: isMax && assetAmountOnNetwork ? assetAmountOnNetwork : transferAmount,
                      symbol: sendMetadata!.asset!.metadata?.symbol,
                    })
                  : formatCurrency({
                      value: isMax && assetValueOnNetwork ? assetValueOnNetwork.value : Number(transferValue!),
                      currency: 'USD',
                    })}
              </CpslText>
              <CpslIcon icon="arrowUpDown" size="16px" color="var(--cpsl-color-text-secondary)" />
            </button>
          )}
        </div>
        {sendMetadata?.asset && sendMetadata?.network && (
          <button
            onClick={() =>
              !['SINGLE_NETWORK', 'NONE'].includes(optionsType)
                ? setStep(optionsType === 'SINGLE_ASSET' ? ModalStep.ACCOUNT_SEND_NETWORK : ModalStep.ACCOUNT_SEND_ASSET)
                : undefined
            }
            style={{
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'flex',
              width: '100%',
              height: '32px',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                gap: '8px',
                flexGrow: 1,
                height: '100%',
              }}
            >
              <AssetNetwork
                assetSrc={sendMetadata!.asset!.metadata!.logoUrl}
                networkSrc={sendMetadata!.network!.metadata!.logoUrl}
                size={32}
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexGrow: 1,
                  position: 'relative',
                  height: '100%',
                }}
              >
                <CpslText
                  variant="bodyM"
                  color="contrast"
                  style={{ position: 'absolute', height: '16px', top: '-4px', left: 0 }}
                >
                  {sendMetadata!.asset!.metadata!.symbol}
                </CpslText>
                <CpslText
                  variant="bodyS"
                  color="secondary"
                  style={{ position: 'absolute', height: '14px', bottom: 0, left: 0 }}
                >
                  Balance:{' '}
                  {formatAssetQuantity({
                    quantity: assetAmountOnNetwork,
                    symbol: '',
                  })}
                  {!!assetValueOnNetwork && (
                    <span style={{ color: 'var(--cpsl-color-text-tertiary) !important' }}>
                      {' ('}
                      {formatCurrency(assetValueOnNetwork)}
                      {')'}
                    </span>
                  )}
                </CpslText>
              </div>
            </div>
            {!isMax && (
              <button
                style={{
                  background: 'transparent',
                  cursor: 'pointer',
                  border: '1px solid var(--cpsl-color-background-16)',
                  color: 'var(--cpsl-color-text-primary)',
                  borderRadius: '4px',
                  padding: '4px',
                }}
                onClick={e => {
                  e.stopPropagation();
                  setIsMax(true);
                }}
              >
                <CpslText variant="bodyXS" color="primary">
                  Max
                </CpslText>
              </button>
            )}
            {optionsType !== 'SINGLE_NETWORK' && (
              <CpslIcon icon="chevronRight" size="24px" color="var(--cpsl-color-text-contrast)" />
            )}
          </button>
        )}
      </div>

      <CpslInput
        placeholder="Enter recipient address"
        value={inputDestinationAddress}
        onCpslInput={e => setInputDestinationAddress(e.detail.value)}
        style={{ width: '100%' }}
      >
        <WalletTypeIcon walletType={selectedWallet!.type!} size="24px" slot="start" />
      </CpslInput>
      {(estimate?.feeValue || estimate?.feeAmount || estimateIsPending) && (
        <div style={{ display: 'flex', width: '100%', gap: '4px', alignItems: 'center', justifyContent: 'space-between' }}>
          <CpslText variant="bodyXS" color="secondary">
            Network Fee
          </CpslText>
          <CpslText variant="bodyXS" color="contrast">
            {estimateIsPending
              ? 'Estimating...'
              : ((sendMetadata?.network?.metadata?.isTestnet ? estimate?.feeAmount : estimate?.feeValue) ??
                estimate?.feeAmount ??
                '0')}
          </CpslText>
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', width: '100%', gap: '4px', alignItems: 'center', justifyContent: 'space-between' }}>
          {error}
        </div>
      )}
      <CpslButton
        variant="primary"
        fullWidth
        pending={estimateIsPending || broadcastIsPending}
        disabled={estimateIsPending || broadcastIsPending || !estimate?.result?.txSerialized || !!estimate?.error}
        onClick={onSubmit}
      >
        Confirm Send
      </CpslButton>
    </div>
  );
}
