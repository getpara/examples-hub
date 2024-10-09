import { useState, useEffect } from 'react';

import TransactionReviewAwaitingApproval from './components/TransactionReviewAwaitingApproval';
import { useCapsule } from '../../components/CapsuleContext';
import { AuthInfo, Fee, SignDoc, TxBody } from 'cosmjs-types/cosmos/tx/v1beta1/tx';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';

import { Wallet } from '@usecapsule/web-sdk';
import { Partner } from '../../types';
import { iconForChainId, iconForCurrency, TransactionReviewContainer, TransactionType } from './TransactionReview';
import { TransactionCoin } from './components/TransactionReviewBody';
import { fetchConversionRate } from '../../utils/transactionReview';
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin';
import { CpslSpinner } from '@usecapsule/react-components';

enum CosmosTransactionReviewState {
  Loading,
  Error,
  Ready,
}

function formatEstimatedCosmosFee(conversionRate: number, fee: Fee) {
  const gasFeeInUSD = Number(fee.amount[0].amount) * conversionRate;

  return gasFeeInUSD < 0.01 ? '< $0.01' : `$${gasFeeInUSD.toFixed(2)}`;
}

function formatCosmosFee(fee: Fee) {
  return `${fee.amount[0].amount} ${fee.amount[0].denom}`;
}

async function transactionCoinFromCosmosCoin(coin: Coin, conversionRate: number): Promise<TransactionCoin> {
  return {
    value: Number(coin.amount),
    units: coin.denom,
    conversionRate,
    icon: iconForCurrency(coin.denom),
  };
}

export interface CosmosTransactionReviewProps {
  partner: Partner;
  wallet: Wallet;
  message: string;
  cosmosSignDocBase64: string;
  confirmTransaction();
  rejectTransaction();
}

function CosmosTransactionReview({
  partner,
  wallet,
  message,
  cosmosSignDocBase64,
  confirmTransaction,
  rejectTransaction,
}: CosmosTransactionReviewProps) {
  const capsule = useCapsule();

  const [txReviewState, setTxReviewState] = useState(CosmosTransactionReviewState.Loading);
  const [coins, setCoins] = useState<TransactionCoin[]>([]);
  const [signDoc, setSignDoc] = useState<SignDoc>(null);
  const [toAddress, setToAddress] = useState<string>(null);
  const [fee, setFee] = useState<Fee>(null);
  const [feeConversionRate, setFeeConversionRate] = useState<number>(null);

  async function performSetup() {
    const cosmonSignDocJsonStringified = atob(cosmosSignDocBase64);
    const cosmosSignDocJson = JSON.parse(cosmonSignDocJsonStringified);
    const cosmosSignDoc = SignDoc.fromJSON(cosmosSignDocJson);
    const txBody = TxBody.decode(cosmosSignDoc.bodyBytes);
    const authInfo = AuthInfo.decode(cosmosSignDoc.authInfoBytes);

    setSignDoc(cosmosSignDoc);

    const msgSend = MsgSend.decode(txBody.messages[0].value);
    setToAddress(msgSend.toAddress);

    let txCoins: TransactionCoin[] = [];
    for (const amount of msgSend.amount) {
      const conversionRate = await fetchConversionRate(capsule, cosmosSignDoc.chainId, amount.denom);
      txCoins.push(await transactionCoinFromCosmosCoin(amount, conversionRate));
    }
    setCoins(txCoins);

    const feeConversionRate = await fetchConversionRate(capsule, cosmosSignDoc.chainId, authInfo.fee.amount[0].denom);
    setFeeConversionRate(feeConversionRate);
    setFee(authInfo.fee);

    setTxReviewState(CosmosTransactionReviewState.Ready);
  }

  useEffect(() => {
    performSetup();
  }, []);

  switch (txReviewState) {
    case CosmosTransactionReviewState.Loading:
    case CosmosTransactionReviewState.Error:
      return (
        <TransactionReviewContainer>
          <CpslSpinner />
        </TransactionReviewContainer>
      );
  }

  return (
    <TransactionReviewAwaitingApproval
      partner={partner}
      coins={coins}
      rawTransaction={message}
      fromWalletName={wallet.name ?? 'Your Wallet'}
      fromWalletAddress={wallet.address}
      toWalletAddress={toAddress}
      transactionType={TransactionType.Transfer}
      estimatedFee={feeConversionRate ? formatEstimatedCosmosFee(feeConversionRate, fee) : formatCosmosFee(fee)}
      estimatedTime={null}
      network={'Cosmos'}
      networkIcon={iconForChainId(signDoc.chainId)}
      chainId={signDoc.chainId}
      confirmTransaction={confirmTransaction}
      rejectTransaction={rejectTransaction}
    />
  );
}

export default CosmosTransactionReview;
