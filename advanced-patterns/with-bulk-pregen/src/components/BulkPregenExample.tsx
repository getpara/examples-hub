"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { HandleListContainer } from "@/components/demos/HandleListContainer";
import { WalletResultsContainer } from "@/components/demos/WalletResultsContainer";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useBulkPregenWallets, type BulkStage } from "@/hooks/useBulkPregenWallets";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { getProgressFields, getSummaryFields, pluralizeWallets } from "@/lib/bulkPregenDisplay";
import { SEPOLIA } from "@/lib/chain";
import { isParaApiKeyConfigured, PARA_API_KEY_VARIABLE } from "@/lib/environment";
import { EXAMPLE } from "@/lib/example";
import { formatBalance } from "@/lib/format";
import type { ResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useHandleList } from "@/lib/useHandleList";

const SUMMARY_STATUS: Record<BulkStage, ResultStatus> = {
  idle: "empty",
  processing: "pending",
  complete: "success",
};

export function BulkPregenExample() {
  const wallet = useParaModalWallet();
  const balance = useAccountBalance();
  const handles = useHandleList();
  const bulk = useBulkPregenWallets();
  const addressCopy = useCopyToClipboard();

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={wallet.address}
      onConnect={wallet.openModal}
      onOpenAccount={wallet.openModal}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          description="Sign in to create pregen wallets in bulk for X and Telegram handles."
          network={SEPOLIA.networkLabel}>
          {!isParaApiKeyConfigured() && (
            <Alert variant="warning" title="Missing API key">
              {`Set ${PARA_API_KEY_VARIABLE} in your .env file and restart the app.`}
            </Alert>
          )}
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const startNewBatch = () => {
    bulk.reset();
    handles.clear();
  };

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={SEPOLIA.name}
        balance={formatBalance(balance.balance, SEPOLIA.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}
      />
      <Workbench
        aside={
          <ResultPanel
            title="Summary"
            status={SUMMARY_STATUS[bulk.stage]}
            emptyMessage="Progress and totals appear here after you create wallets."
            pendingLabel="Processing"
            pendingMessage={`Creating ${pluralizeWallets(bulk.progress.total)}.`}
            successLabel="Complete"
            fields={bulk.stage === "processing" ? getProgressFields(bulk.progress) : getSummaryFields(bulk.summary)}>
            {bulk.stage === "complete" && bulk.summary.failed > 0 && (
              <Alert variant="warning" title={`${pluralizeWallets(bulk.summary.failed)} not created`}>
                Retry the failed rows from the results.
              </Alert>
            )}
          </ResultPanel>
        }>
        {bulk.stage === "idle" ? (
          <HandleListContainer handles={handles} onCreate={() => void bulk.create(handles.entries)} />
        ) : (
          <WalletResultsContainer bulk={bulk} onStartNewBatch={startNewBatch} />
        )}
      </Workbench>
    </AppShell>
  );
}
