import { Workbench } from "@/components/layout/Workbench";
import { AccountStripWithTestIds } from "@/components/ui/AccountStripWithTestIds";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { TransactionResult } from "@/components/ui/TransactionResult";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useFaucet } from "@/hooks/useFaucet";
import { useSendTransaction } from "@/hooks/useSendTransaction";
import { SEPOLIA, explorerTxUrl } from "@/lib/chain";
import { formatBalance } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { describeFaucetError, describeSendError, transactionPendingMessage } from "@/lib/transactionCopy";
import { FAUCET_RETURN_ADDRESS } from "@/lib/transfer";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { getFaucetHint, getSendHint } from "@/lib/walletActionHints";

interface WalletActionsContainerProps {
  address: string;
}

const EXPLORER_LABEL = `View on ${SEPOLIA.explorerName}`;

export function WalletActionsContainer({ address }: WalletActionsContainerProps) {
  const balance = useAccountBalance(address);
  const faucet = useFaucet();
  const transfer = useSendTransaction(FAUCET_RETURN_ADDRESS);
  const addressCopy = useCopyToClipboard();
  const hashCopy = useCopyToClipboard();

  const faucetHint = getFaucetHint({ isBalanceLoading: balance.isLoading, balanceWei: balance.balanceWei });
  const sendHint = getSendHint({
    isBalanceLoading: balance.isLoading,
    balanceWei: balance.balanceWei,
    isSignerReady: transfer.isReady,
  });
  const sendError = describeSendError(transfer.error, transfer.isDenied);

  const requestFunds = async () => {
    transfer.reset();
    await faucet.request();
    await balance.refresh();
  };

  const sendFunds = async () => {
    faucet.reset();
    await transfer.send();
    await balance.refresh();
  };

  const result =
    transfer.status === "idle" ? (
      <TransactionResult
        status={getResultStatus({ isPending: faucet.isPending, errorMessage: faucet.error, value: faucet.txHash })}
        hash={faucet.txHash}
        hashTestId="custom-oidc-faucet-tx"
        pendingMessage={transactionPendingMessage(faucet.txHash, "Requesting Sepolia testnet ETH.")}
        explorerHref={faucet.txHash ? explorerTxUrl(faucet.txHash) : undefined}
        explorerLabel={EXPLORER_LABEL}
        errorTitle="Faucet request failed"
        errorMessage={describeFaucetError(faucet.error, faucet.isRateLimited)}
        copyStatus={hashCopy.status}
        onCopy={() => faucet.txHash && hashCopy.copy(faucet.txHash)}
      />
    ) : (
      <TransactionResult
        status={getResultStatus({ isPending: transfer.isPending, errorMessage: transfer.error, value: transfer.txHash })}
        hash={transfer.txHash}
        hashTestId="custom-oidc-send-tx-hash"
        pendingMessage={transactionPendingMessage(transfer.txHash, "Signing the transaction with your Para wallet.")}
        explorerHref={transfer.txHash ? explorerTxUrl(transfer.txHash) : undefined}
        explorerLabel={EXPLORER_LABEL}
        errorTitle={sendError.title}
        errorMessage={sendError.message}
        copyStatus={hashCopy.status}
        onCopy={() => transfer.txHash && hashCopy.copy(transfer.txHash)}
      />
    );

  return (
    <>
      <AccountStripWithTestIds
        address={address}
        addressTestId="custom-oidc-wallet"
        onCopyAddress={() => addressCopy.copy(address)}
        addressCopyStatus={addressCopy.status}
        network={SEPOLIA.name}
        balance={formatBalance(balance.balance, SEPOLIA.currencySymbol)}
        balanceTestId="custom-oidc-balance"
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={() => void balance.refresh()}
      />
      <Workbench aside={result}>
        <ActionPanel
          title="Request faucet"
          api="useRequestFaucet()"
          description={`Fund this wallet with ${SEPOLIA.name} ETH.`}
          hint={faucetHint}
          actions={
            <Button
              variant="outline"
              size="lg"
              isLoading={faucet.isPending}
              disabled={Boolean(faucetHint)}
              onClick={() => void requestFunds()}
              data-testid="custom-oidc-faucet">
              Request testnet ETH
            </Button>
          }
        />
        <ActionPanel
          title="Send ETH"
          api="ethersSigner.signTransaction()"
          description={`Sends ${transfer.amount} ETH back to the demo faucet. A custom limit set in Para denies larger sends before they are signed.`}
          hint={sendHint}
          actions={
            <Button
              size="lg"
              isLoading={transfer.isPending}
              disabled={Boolean(sendHint)}
              onClick={() => void sendFunds()}
              data-testid="custom-oidc-send-tx">
              {`Send ${transfer.amount} ETH back to faucet`}
            </Button>
          }>
          <Facts
            rows={[
              { label: "Recipient", value: "Demo faucet", title: FAUCET_RETURN_ADDRESS },
              { label: "Amount", value: `${transfer.amount} ${SEPOLIA.currencySymbol}` },
            ]}
          />
        </ActionPanel>
      </Workbench>
    </>
  );
}
