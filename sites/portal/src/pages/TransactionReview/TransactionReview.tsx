import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { usePara } from '../../components/ParaContext';
import { authLogin, authLoginWithPassword } from '../../utils/authLogin';
import SignMessageReview from './SignMessageReview';
import { useModalOutletContext } from '../../hooks/useModalOutletContext';

import styled from 'styled-components';
import ETHTransactionReview from './ETHTransactionReview';
import CosmosTransactionReview from './CosmosTransactionReview';
import { CpslIcon, CpslSpinner } from '@getpara/react-components';
import { AuthMethod } from '@getpara/web-sdk';
import { EnterPasswordStep } from '../AuthLogin/components/EnterPasswordStep';

const MAX_AUTH_RETRIES = 5;

export enum TransactionReviewState {
  Loading,
  Error,
  PasswordLogin,
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
  const para = usePara();
  const { userId, pendingTransactionId } = useParams();

  const [searchParams] = useSearchParams();
  const timeoutMs = searchParams.get('timeoutMs');

  const { toggleBranding } = useModalOutletContext();

  const [partner, setPartner] = useState(null);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [decodedTx, setDecodedTx] = useState(null);
  const [txData, setTxData] = useState(null);
  const [transactionReviewState, setTransactionReviewState] = useState(TransactionReviewState.Loading);
  const [wallet, setWallet] = useState(null);
  const [message, setMessage] = useState(null);
  const [loginWithPasswordError, setLoginWithPasswordError] = useState<string | undefined>();

  async function handleConfirmTransaction() {
    let retriesLeft = MAX_AUTH_RETRIES;

    while (retriesLeft > 0) {
      try {
        await para.ctx.client.acceptPendingTransaction(userId, pendingTransactionId);
        break;
      } catch (e) {
        console.error(e);
        await authLogin(para, { partnerId: partner.id, userId });
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
    await para.ctx.client.deletePendingTransaction(userId, pendingTransactionId);
    window.close();
  }

  async function performSetup() {
    const res = await para.touchSession();
    const partnerId = res.data.partnerId;

    let pendingTransaction, partner, decodedTx, txData;

    let retriesLeft = MAX_AUTH_RETRIES;

    // Close the window after the timeout
    if (!!timeoutMs && !isNaN(parseInt(timeoutMs))) {
      setTimeout(() => {
        window.close();
      }, parseInt(timeoutMs));
    }

    const supportedAuthMethods = await para.supportedAuthMethods({ userId });

    if (supportedAuthMethods.has(AuthMethod.PASSWORD)) {
      setTransactionReviewState(TransactionReviewState.PasswordLogin);
    } else if (supportedAuthMethods.has(AuthMethod.PASSKEY)) {
      while (retriesLeft > 0) {
        try {
          ({ pendingTransaction, partner, decodedTx, txData } = (
            await para.ctx.client.getPendingTransaction(userId, pendingTransactionId)
          ).data);

          setPartner(partner);
          setDecodedTx(decodedTx);
          setTxData(txData);
          setPendingTransaction(pendingTransaction);
          break;
        } catch (e) {
          console.error(e);

          if (e.status === 401) {
            await authLogin(para, { partnerId, userId });
          }

          setTransactionReviewState(TransactionReviewState.Error);
          retriesLeft--;
        }

        if (retriesLeft === 0) {
          setTransactionReviewState(TransactionReviewState.Error);
          return;
        }
      }

      await para.userSetupAfterLogin();
      await para.setupAfterLogin();

      const walletId = pendingTransaction.walletId;
      let { wallets } = (await para.ctx.client.getWallets(userId)).data;
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
  }

  const loginWithPassword = async (password: string) => {
    const res = await para.touchSession();
    const partnerId = res.data.partnerId;
    try {
      setLoginWithPasswordError(undefined);
      await para.touchSession();
      await authLoginWithPassword(para, { password, partnerId, userId });

      await para.userSetupAfterLogin();
      await para.setupAfterLogin();

      const { pendingTransaction, partner, decodedTx, txData } = (
        await para.ctx.client.getPendingTransaction(userId, pendingTransactionId)
      ).data;

      const walletId = pendingTransaction.walletId;
      let { wallets } = (await para.ctx.client.getWallets(userId)).data;
      const wallet = wallets.find(w => w.id === walletId);
      setWallet(wallet);

      setPartner(partner);
      setDecodedTx(decodedTx);
      setTxData(txData);
      setPendingTransaction(pendingTransaction);

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
    } catch (err) {
      setLoginWithPasswordError('Password is incorrect');
    }
  };

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
    case TransactionReviewState.PasswordLogin:
      return <EnterPasswordStep error={loginWithPasswordError} onLoginClick={loginWithPassword} />;
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
