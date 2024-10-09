import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useCapsule } from '../../components/CapsuleContext';
import { authLogin } from '../../utils/authLogin';
import SignMessageReview from './SignMessageReview';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';

import styled from 'styled-components';
import ETHTransactionReview from './ETHTransactionReview';
import CosmosTransactionReview from './CosmosTransactionReview';
import { CpslIcon, CpslSpinner } from '@usecapsule/react-components';

const MAX_AUTH_RETRIES = 5;

export enum TransactionReviewState {
  Loading,
  Error,
  AwaitingSignMessageApproval,
  AwaitingSignETHTransactionApproval,
  AwaitingSignCosmosMessageApproval,
}

export enum TransactionType {
  // no data field
  Transfer = 'Transfer',
  // data field that does not have the mintPublic name
  Send = 'Send Transaction',
  // data field that has the mintPublic name
  MintNFT = 'Mint NFT',
}

export function iconForChainId(chainId: string): JSX.Element {
  switch (chainId.toLowerCase()) {
    case '1':
      return <NetworkIcon icon="ethereum" />;
    case 'theta-testnet-001':
      return <NetworkIcon icon="cosmos" />;
    default:
      return null;
  }
}

export function iconForCurrency(currency: string): JSX.Element {
  switch (currency.toLowerCase()) {
    case 'eth':
      return <CurrencyIcon icon="ethereum" />;
    case 'pol':
      return <CurrencyIcon icon="polygon" />;
    case 'uatom':
      return <CurrencyIcon icon="cosmos" />;
    default:
      return null;
  }
}

function TransactionReview() {
  const capsule = useCapsule();
  const { userId, pendingTransactionId } = useParams();
  const { toggleBranding } = useModalOutletContext();

  const [partner, setPartner] = useState(null);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [decodedTx, setDecodedTx] = useState(null);
  const [txData, setTxData] = useState(null);
  const [transactionReviewState, setTransactionReviewState] = useState(TransactionReviewState.Loading);
  const [wallet, setWallet] = useState(null);
  const [message, setMessage] = useState(null);

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
    const res = await capsule.touchSession();
    const partnerId = res.data.partnerId;

    let pendingTransaction, partner, decodedTx, txData;

    let retriesLeft = MAX_AUTH_RETRIES;

    while (retriesLeft > 0) {
      try {
        ({ pendingTransaction, partner, decodedTx, txData } = (
          await capsule.ctx.capsuleClient.getPendingTransaction(userId, pendingTransactionId)
        ).data);

        setPartner(partner);
        setDecodedTx(decodedTx);
        setTxData(txData);
        setPendingTransaction(pendingTransaction);
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
    setWallet(wallet);

    if (pendingTransaction?.cosmosSignDocBase64) {
      setTransactionReviewState(TransactionReviewState.AwaitingSignCosmosMessageApproval);
      setMessage(pendingTransaction.messageBase64);
      return;
    }

    if (pendingTransaction?.messageBase64) {
      setTransactionReviewState(TransactionReviewState.AwaitingSignMessageApproval);
      setMessage(pendingTransaction.messageBase64);
      return;
    }

    setTransactionReviewState(TransactionReviewState.AwaitingSignETHTransactionApproval);
  }

  useEffect(() => {
    toggleBranding(false);
    performSetup();
  }, []);

  switch (transactionReviewState) {
    case TransactionReviewState.Loading:
    case TransactionReviewState.Error:
      return (
        <TransactionReviewContainer>
          <CpslSpinner />
        </TransactionReviewContainer>
      );
    case TransactionReviewState.AwaitingSignMessageApproval:
      return (
        <TransactionReviewContainer>
          <SignMessageReview
            partner={partner}
            fromWalletAddress={wallet.address}
            message={message}
            confirmSignMessage={handleConfirmTransaction}
            rejectSignMessage={handleRejectTransaction}
          />
        </TransactionReviewContainer>
      );
    case TransactionReviewState.AwaitingSignETHTransactionApproval:
      return (
        <TransactionReviewContainer>
          <ETHTransactionReview
            partner={partner}
            wallet={wallet}
            decodedTx={decodedTx}
            txData={txData}
            confirmTransaction={handleConfirmTransaction}
            rejectTransaction={handleRejectTransaction}
          />
        </TransactionReviewContainer>
      );
    case TransactionReviewState.AwaitingSignCosmosMessageApproval:
      return (
        <TransactionReviewContainer>
          <CosmosTransactionReview
            partner={partner}
            wallet={wallet}
            message={message}
            cosmosSignDocBase64={pendingTransaction.cosmosSignDocBase64}
            confirmTransaction={handleConfirmTransaction}
            rejectTransaction={handleRejectTransaction}
          />
        </TransactionReviewContainer>
      );
  }
}

export default TransactionReview;

export const TransactionReviewContainer = styled.div`
  body {
    background-color: white !important;
  }

  align-items: center;
  display: flex;
  justify-content: center;

  width: 100%;
`;

export const NetworkIcon = styled(CpslIcon)`
  --height: 16px;
  --width: 16px;
`;

export const CurrencyIcon = styled(CpslIcon)`
  --height: 24px;
  --width: 24px;
`;
