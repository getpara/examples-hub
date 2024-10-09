import { useState, useEffect } from 'react';

import TransactionReviewAwaitingApproval from './components/TransactionReviewAwaitingApproval';
import { FeeMarketEIP1559Transaction } from '@ethereumjs/tx';
import web3 from 'web3';
import { useCapsule } from '../../components/CapsuleContext';

import { Partner } from '../../types';
import { Wallet } from '@usecapsule/web-sdk';
import { iconForChainId, iconForCurrency, TransactionReviewContainer, TransactionType } from './TransactionReview';
import { fetchChainData } from '../../utils/transactionReview';
import { CpslSpinner } from '@usecapsule/react-components';

enum ETHTransactionReviewState {
  Loading,
  Error,
  Ready,
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

export interface ETHTransactionReviewProps {
  partner: Partner;
  wallet: Wallet;
  decodedTx: any;
  txData: any;
  confirmTransaction();
  rejectTransaction();
}

function ETHTransactionReview({
  partner,
  wallet,
  decodedTx,
  txData,
  confirmTransaction,
  rejectTransaction,
}: ETHTransactionReviewProps) {
  const capsule = useCapsule();

  const [feeMarketTransaction, setFeeMarketTransaction] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [conversionRate, setConversionRate] = useState(null);
  const [gasEstimate, setGasEstimate] = useState(null);
  const [_gasOracle, setGasOracle] = useState(null);
  const [chainData, setChainData] = useState(null);
  const [txReviewState, setTxReviewState] = useState(ETHTransactionReviewState.Loading);

  async function performSetup() {
    const feeMktTransaction = FeeMarketEIP1559Transaction.fromTxData(decodedTx);
    setFeeMarketTransaction(feeMktTransaction);

    if (txData?.name === 'mintPublic') {
      setTransactionType(TransactionType.MintNFT);
    } else if (txData && txData !== '0x') {
      setTransactionType(TransactionType.Send);
    } else {
      setTransactionType(TransactionType.Transfer);
    }

    setChainData(await fetchChainData(Number(feeMktTransaction.chainId)));
    setTxReviewState(ETHTransactionReviewState.Ready);
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

  switch (txReviewState) {
    case ETHTransactionReviewState.Loading:
    case ETHTransactionReviewState.Error:
      return (
        <TransactionReviewContainer>
          <CpslSpinner />
        </TransactionReviewContainer>
      );
  }

  return (
    <TransactionReviewAwaitingApproval
      partner={partner}
      coins={[
        {
          value: Number(web3.utils.fromWei(feeMarketTransaction.value, 'ether')),
          units: chainData?.nativeCurrency.symbol,
          icon: iconForCurrency(chainData?.nativeCurrency.symbol),
          conversionRate,
        },
      ]}
      rawTransaction={decodedTx}
      fromWalletName={wallet.name ?? 'Your Wallet'}
      fromWalletAddress={wallet.address}
      toWalletAddress={decodedTx.to}
      transactionType={transactionType}
      estimatedFee={conversionRate ? formatEstimatedFee(conversionRate, feeMarketTransaction) : null}
      estimatedTime={gasEstimate ? formatEstimatedTime(gasEstimate) : null}
      network={chainData?.name}
      networkIcon={iconForChainId(feeMarketTransaction.chainId.toString())}
      chainId={feeMarketTransaction.chainId.toString()}
      confirmTransaction={confirmTransaction}
      rejectTransaction={rejectTransaction}
    />
  );
}

export default ETHTransactionReview;
