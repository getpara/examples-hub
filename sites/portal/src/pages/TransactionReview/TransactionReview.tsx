import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import TransactionReviewAwaitingApproval from './components/TransactionReviewAwaitingApproval';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import web3 from 'web3';
import { useCapsule } from '../../components/CapsuleContext';
import { authLogin } from '../../utils/authLogin';
import SignMessageReview from './components/SignMessageReview';
import { CpslIcon } from '@usecapsule/react-components';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';

import axios from 'axios';
import styled from 'styled-components';

const MAX_AUTH_RETRIES = 5;

export enum TransactionReviewState {
  Loading,
  Error,
  AwaitingSignMessageApproval,
  AwaitingSignTransactionApproval,
}

export enum TransactionType {
  // no data field
  Transfer = 'Transfer',
  // data field that does not have the mintPublic name
  Send = 'Send Transaction',
  // data field that has the mintPublic name
  MintNFT = 'Mint NFT',
  // messageBase64 field present
  Sign = 'Sign',
}

async function fetchChainData(chainId: number) {
  const res = await axios.get(
    `https://raw.githubusercontent.com/ethereum-lists/chains/refs/heads/master/_data/chains/eip155-${chainId}.json`,
  );

  return res.data;
}

function formatEstimatedFee(conversionRate: number, feeMarketTransaction: FeeMarketEIP1559Transaction) {
  const totalFeePerGasInWei = BigInt(
    web3.utils.toWei(feeMarketTransaction.maxFeePerGas + feeMarketTransaction.maxPriorityFeePerGas, 'gwei'),
  );

  const totalGasCostInWei = totalFeePerGasInWei * feeMarketTransaction.gasLimit;
  const totalGasCostInEther = +web3.utils.fromWei(totalGasCostInWei, 'ether');
  const totalGasCostInUSD = totalGasCostInEther * conversionRate;

  return `$${totalGasCostInUSD.toFixed(2)}`;
}

function formatEstimatedTime(estimatedTimeInSeconds: number) {
  const hours = Math.floor(estimatedTimeInSeconds / 3600);
  const minutes = Math.floor(estimatedTimeInSeconds / 60);
  const seconds = estimatedTimeInSeconds % 60;

  if (hours > 0) {
    return 'More than an hour';
  }

  if (minutes > 0) {
    return `~${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }

  if (seconds > 2) {
    return `~${seconds} seconds`;
  }

  return 'Less than 2 seconds';
}

function iconForChainId(chainId: number) {
  switch (chainId) {
    case 1:
      return <NetworkIcon icon="ethereum" />;
    default:
      return null;
  }
}

function iconForCurrency(currency: string) {
  switch (currency) {
    case 'ETH':
      return <CurrencyIcon icon="ethereum" />;
    case 'POL':
      return <CurrencyIcon icon="polygon" />;
    default:
      return null;
  }
}

const TransactionReviewContainer = styled.div`
  body {
    background-color: white !important;
  }

  width: 100%;
`;

function TransactionReview() {
  const capsule = useCapsule();
  const { userId, pendingTransactionId } = useParams();

  const { toggleBranding } = useModalOutletContext();
  toggleBranding(false);

  const [feeMarketTransaction, setFeeMarketTransaction] = useState(null);
  const [partner, setPartner] = useState(null);
  const [decodedTx, setDecodedTx] = useState(null);
  const [transactionReviewState, setTransactionReviewState] = useState(TransactionReviewState.Loading);
  const [wallet, setWallet] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);
  const [message, setMessage] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [_gasOracle, setGasOracle] = useState(null);
  const [chainData, setChainData] = useState(null);

  async function handleConfirmTransaction() {
    let retriesLeft = MAX_AUTH_RETRIES;

    while (retriesLeft > 0) {
      try {
        await capsule.ctx.capsuleClient.acceptPendingTransaction(userId, pendingTransactionId);
        break;
      } catch (e) {
        console.error(e);
        await authLogin(capsule, partner.id, userId, null, null, null, null, null);
      }

      retriesLeft--;

      if (retriesLeft === 0) {
        setTransactionReviewState(TransactionReviewState.Error);
        return;
      }
    }

    window.close();
  }

  async function handleRejectTransaction() {
    await capsule.ctx.capsuleClient.deletePendingTransaction(userId, pendingTransactionId);
    window.close();
  }

  async function performSetup() {
    const res = await capsule.ctx.capsuleClient.touchSession();
    const partnerId = res.data.partnerId;

    let pendingTransaction, partner, decodedTx, txData;

    let retriesLeft = MAX_AUTH_RETRIES;

    while (retriesLeft > 0) {
      try {
        ({ pendingTransaction, partner, decodedTx, txData } = (
          await capsule.ctx.capsuleClient.getPendingTransaction(userId, pendingTransactionId)
        ).data);
        break;
      } catch (e) {
        console.error(e);

        if (e.response?.status === 401) {
          await authLogin(capsule, partnerId, userId, null, null, null, null, null);
          capsule.userSetupAfterLogin();
          capsule.setupAfterLogin();
        }

        setTransactionReviewState(TransactionReviewState.Error);
        retriesLeft--;
      }

      if (retriesLeft === 0) {
        setTransactionReviewState(TransactionReviewState.Error);
        return;
      }
    }

    const walletId = pendingTransaction.walletId;
    let { wallets } = (await capsule.ctx.capsuleClient.getWallets(userId)).data;
    const wallet = wallets.find(w => w.id === walletId);

    setPartner(partner);
    setWallet(wallet);

    if (pendingTransaction?.messageBase64) {
      setTransactionType(TransactionType.Sign);
      setTransactionReviewState(TransactionReviewState.AwaitingSignMessageApproval);
      setWallet(wallet);
      setMessage(pendingTransaction.messageBase64);
      return;
    }

    const feeMktTransaction = FeeMarketEIP1559Transaction.fromTxData(decodedTx);
    setFeeMarketTransaction(feeMktTransaction);
    setDecodedTx(decodedTx);

    if (txData?.name === 'mintPublic') {
      setTransactionType(TransactionType.MintNFT);
    } else if (txData && txData !== '0x') {
      setTransactionType(TransactionType.Send);
    } else {
      setTransactionType(TransactionType.Transfer);
    }

    setTransactionReviewState(TransactionReviewState.AwaitingSignTransactionApproval);
    setChainData(await fetchChainData(Number(feeMktTransaction.chainId)));
  }

  useEffect(() => {
    performSetup();
  }, []);

  useEffect(() => {
    async function fetchGasEstimate() {
      try {
        const res = await capsule.ctx.capsuleClient.getGasEstimate(
          feeMarketTransaction.chainId,
          web3.utils.toWei(feeMarketTransaction.maxFeePerGas + feeMarketTransaction.maxPriorityFeePerGas, 'gwei'),
        );
        setGasEstimate(res.result);
      } catch (error) {
        console.error('Error fetching gas estimate:', error);
      }
    }

    async function fetchGasOracle() {
      try {
        const res = await capsule.ctx.capsuleClient.getGasOracle(feeMarketTransaction.chainId);
        setGasOracle(res);
      } catch (error) {
        console.error('Error fetching gas oracle:', error);
      }
    }

    if (feeMarketTransaction) {
      fetchGasOracle();
      fetchGasEstimate();
    }
  }, [feeMarketTransaction]);

  useEffect(() => {
    async function fetchConversionRate() {
      try {
        const res = await capsule.ctx.capsuleClient.getConversionRate(
          chainData.chainId,
          chainData.nativeCurrency.symbol,
          'USD',
        );
        setConversionRate(res.conversionRate);
      } catch (error) {
        console.error('Error fetching conversion rate:', error);
      }
    }

    if (chainData) {
      fetchConversionRate();
    }
  }, [chainData]);

  switch (transactionReviewState) {
    case TransactionReviewState.Loading:
      return <TransactionReviewContainer></TransactionReviewContainer>;
    case TransactionReviewState.Error:
      return <TransactionReviewContainer>Error</TransactionReviewContainer>;
    case TransactionReviewState.AwaitingSignMessageApproval:
      return (
        <TransactionReviewContainer>
          <SignMessageReview
            partner={partner}
            fromWalletAddress={'creivriwvwmjnvorw'}
            message={message}
            confirmSignMessage={handleConfirmTransaction}
            rejectSignMessage={handleRejectTransaction}
          />
        </TransactionReviewContainer>
      );
    case TransactionReviewState.AwaitingSignTransactionApproval:
      return (
        <TransactionReviewContainer>
          <TransactionReviewAwaitingApproval
            partner={partner}
            transactionValue={web3.utils.fromWei(feeMarketTransaction.value, 'ether')}
            transactionUnits={chainData?.nativeCurrency.symbol}
            transactionUnitsIcon={iconForCurrency(chainData?.nativeCurrency.symbol)}
            rawTransaction={decodedTx}
            fromWalletName={wallet.name ?? 'Your Wallet'}
            fromWalletAddress={wallet.address}
            toWalletAddress={decodedTx.to}
            transactionType={transactionType}
            conversionRate={conversionRate}
            transactionState={transactionReviewState}
            estimatedFee={conversionRate ? formatEstimatedFee(conversionRate, feeMarketTransaction) : null}
            estimatedTime={gasEstimate ? formatEstimatedTime(gasEstimate) : null}
            network={chainData?.name}
            networkIcon={iconForChainId(Number(feeMarketTransaction.chainId))}
            chainId={Number(feeMarketTransaction.chainId)}
            confirmTransaction={handleConfirmTransaction}
            rejectTransaction={handleRejectTransaction}
          />
        </TransactionReviewContainer>
      );
  }
}

export default TransactionReview;

const NetworkIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
`;

const CurrencyIcon = styled(CpslIcon)`
  --height: 24px;
  --width: 24px;
`;
