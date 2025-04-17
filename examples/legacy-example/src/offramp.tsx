import { Button, Checkbox, HStack, Input, Select, VStack } from '@chakra-ui/react';
import {
  Network,
  OnRampAsset,
  OnRampProvider,
  SuccessfulSignatureRes,
  TWalletType,
  hexStringToBase64,
} from '@getpara/core-sdk';
import { getContractAddressFromAsset, getChainId } from '@getpara/react-common';
import ParaWeb from '@getpara/web-sdk';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export function OfframpSend({
  para,
  walletId,
  walletType,
  testMode,
  setTestMode,
}: {
  para: ParaWeb;
  walletType: TWalletType;
  walletId: string;
  testMode: boolean;
  setTestMode: Dispatch<SetStateAction<boolean>>;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [[network, asset], setAsset] = useState<[Network | null, OnRampAsset | null]>([
    Network.ETHEREUM,
    OnRampAsset.ETHEREUM,
  ]);
  const [assetQuantity, setAssetQuantity] = useState('0');

  useEffect(() => {
    toast(status);
  }, [status]);

  return (
    <VStack w="100%">
      <HStack w="100%">
        <Input
          value={assetQuantity}
          placeholder="Quantity"
          onKeyDown={e => {
            if (!/^(\d|\.)$/.test(e.key) && !['Delete', 'Backspace', 'Tab', 'Shift'].includes(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={e => {
            const numericValue = (e.currentTarget?.value || '').replace(/[^0-9.]/g, '');
            if (numericValue !== '') {
              const formattedValue = `${parseFloat(numericValue).toString()}${numericValue.endsWith('.') ? '.' : ''}`;
              setAssetQuantity(formattedValue);
            } else {
              setAssetQuantity(null);
            }
          }}
          onBlur={e => {
            const numericValue = (e.currentTarget.value || '').replace(/[^0-9.]/g, '');
            if (numericValue === '') {
              setAssetQuantity(null);
            } else {
              setAssetQuantity(parseFloat(numericValue).toString());
            }
          }}
        />

        <Select value={asset} onChange={e => setAsset([network, e.currentTarget.value as OnRampAsset])}>
          <option value={OnRampAsset.ETHEREUM}>ETH</option>
          <option value={OnRampAsset.USDC}>USDC</option>
          <option value={OnRampAsset.TETHER}>USDT</option>
          <option value={OnRampAsset.SOLANA}>SOL</option>
        </Select>
        <Select value={network} onChange={e => setAsset([e.currentTarget.value as Network, asset])}>
          <option value={Network.ETHEREUM}>Ethereum</option>
          <option value={Network.SEPOLIA}>Sepolia</option>
          <option value={Network.BASE}>Base</option>
          <option value={Network.ARBITRUM}>Arbitrum</option>
          <option value={Network.OPTIMISM}>Optimism</option>
          <option value={Network.POLYGON}>Polygon</option>
          <option value={Network.CELO}>Celo</option>
          <option value={Network.SOLANA}>Solana</option>
          <option value={Network.SOLANA_DEVNET}>Solana Devnet</option>
        </Select>
      </HStack>
      <HStack w="100%">
        <Input
          value={destinationAddress}
          onChange={e => setDestinationAddress(e.currentTarget.value)}
          placeholder="Destination"
        />
        <HStack w="30%">
          <Checkbox isChecked={testMode} id="testMode" onChange={e => setTestMode(e.currentTarget.checked)} />
          <label htmlFor="testMode">Test Mode</label>
        </HStack>
      </HStack>
      <Button
        w="100%"
        colorScheme="teal"
        onClick={async () => {
          setStatus('Generating offramp tx...');

          let sent;

          try {
            const chainId = getChainId(network);
            const generated = await para.ctx.client.generateOffRampTx(para.getUserId(), {
              walletId,
              walletType,
              provider: OnRampProvider.MOONPAY,
              chainId: getChainId(network),
              destinationAddress,
              sourceAddress: para.getDisplayAddress(walletId, { addressType: walletType }),
              contractAddress: getContractAddressFromAsset(network, asset),
              testMode,
              assetQuantity,
            });

            setStatus('Signing tx...');

            let signature: string | undefined;
            switch (walletType) {
              case 'EVM':
                signature = (
                  (await para.signTransaction({
                    walletId,
                    rlpEncodedTxBase64: hexStringToBase64(generated.tx),
                    chainId,
                  })) as SuccessfulSignatureRes
                )?.signature;
                break;
              case 'SOLANA':
                signature = (
                  (await para.signMessage({ walletId, messageBase64: generated.message })) as SuccessfulSignatureRes
                )?.signature;
                break;

              default:
                throw new Error(`unsupported wallet type: ${walletType}`);
            }

            setStatus('Broadcasting tx...');

            sent = await para.ctx.client.sendOffRampTx(para.getUserId(), {
              tx: generated.tx,
              signature: walletType === 'EVM' ? `0x${signature}` : signature,
              sourceAddress: para.getDisplayAddress(walletId, { addressType: walletType }),
              network,
              walletId,
              walletType,
            });
          } catch (e) {
            setStatus(`Error: ${e.response.data}`);
            return;
          }

          setStatus(`Sent offramp tx: ${sent.txHash}`);
        }}
      >
        Send Offramp Tx
      </Button>
    </VStack>
  );
}
