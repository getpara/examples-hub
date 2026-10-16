"use client";

import { BridgeFormContainer } from "@/components/BridgeFormContainer";
import { TransferLookupContainer } from "@/components/TransferLookupContainer";
import { TransferProgressContainer } from "@/components/TransferProgressContainer";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { BalanceCell } from "@/components/ui/BalanceCell";
import { useBridgeTransfer } from "@/hooks/useBridgeTransfer";
import { useParaBridgeAdapter } from "@/hooks/useParaBridgeAdapter";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { ARC, BASE, ROUTE } from "@/lib/chain";
import { formatBalance } from "@/lib/format";
import { USDC, formatNative, formatUsdc } from "@/lib/tokens";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

interface BridgeWorkspaceProps {
  address: string;
}

function formatReading(amount: bigint | undefined, format: (value: bigint) => string, symbol: string) {
  return amount === undefined ? undefined : formatBalance(format(amount), symbol);
}

export function BridgeWorkspace({ address }: BridgeWorkspaceProps) {
  const addressCopy = useCopyToClipboard();
  const bridgeAdapter = useParaBridgeAdapter();
  const wallet = useWalletBalances(address);
  const transfer = useBridgeTransfer({ adapter: bridgeAdapter.adapter, onSettled: wallet.refresh });
  const balances = wallet.balances ?? undefined;

  return (
    <>
      <AccountStrip
        address={address}
        onCopyAddress={() => addressCopy.copy(address)}
        addressCopyStatus={addressCopy.status}
        networkLabel="Route"
        network={ROUTE.label}>
        <BalanceCell
          label={`${BASE.name} ${USDC.symbol}`}
          value={formatReading(balances?.baseUsdc, formatUsdc, USDC.symbol)}
          isLoading={wallet.isLoading}
          testId="balance-base-usdc"
        />
        <BalanceCell
          label={`${BASE.name} ${BASE.currencySymbol}`}
          value={formatReading(balances?.baseEth, formatNative, BASE.currencySymbol)}
          isLoading={wallet.isLoading}
          testId="balance-base-eth"
        />
        <BalanceCell
          label={`${ARC.name} ${USDC.symbol}`}
          value={formatReading(balances?.arcUsdc, formatUsdc, USDC.symbol)}
          isLoading={wallet.isLoading}
          testId="balance-arc-usdc"
        />
      </AccountStrip>
      <Workbench
        aside={
          <div className="grid content-start divide-y divide-border">
            <TransferProgressContainer transfer={transfer} />
            <TransferLookupContainer />
          </div>
        }>
        <BridgeFormContainer
          adapter={bridgeAdapter.adapter}
          isAdapterLoading={bridgeAdapter.isLoading}
          balances={wallet.balances}
          isBalanceLoading={wallet.isLoading}
          isBalanceRefreshing={wallet.isRefreshing}
          balanceErrorMessage={wallet.errorMessage}
          onRefreshBalances={() => void wallet.refresh()}
          isTransferRunning={transfer.isRunning}
          onBridge={transfer.start}
        />
      </Workbench>
    </>
  );
}
