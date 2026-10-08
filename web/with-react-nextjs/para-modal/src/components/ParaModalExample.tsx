"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function ParaModalExample() {
  const wallet = useParaModalWallet();
  const signing = useSignHelloWorld();
  const balance = useAccountBalance();
  const addressCopy = useCopyToClipboard();
  const signatureCopy = useCopyToClipboard();

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
          description="Connect to continue. Your wallet is created the first time you sign in."
          network={SEPOLIA.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

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
            status={getResultStatus({
              isPending: signing.isPending,
              errorMessage: signing.errorMessage,
              value: signing.signature,
            })}
            emptyMessage="The signature appears here after you sign."
            pendingMessage="Approve the request in the Para window."
            successLabel="Signed"
            fields={
              signing.signature
                ? [{ label: "Signature", value: signing.signature, testId: "sign-signature-display" }]
                : []
            }
            onCopy={() => signing.signature && signatureCopy.copy(signing.signature)}
            copiedMessage="Signature copied"
            copyStatus={signatureCopy.status}
            errorTitle="Signing failed"
            errorMessage={formatErrorMessage(signing.errorMessage)}
          />
        }>
        <ActionPanel
          title="Sign a message"
          api="signMessage({ walletId, messageBase64 })"
          description="Signing proves you control this account. It does not send a transaction or cost gas."
          actions={
            <Button size="lg" isLoading={signing.isPending} onClick={() => signing.sign()} data-testid="sign-submit-button">
              {`Sign ${signing.message}`}
            </Button>
          }>
          <TextAreaField label="Message" value={signing.message} readOnly hint="The app signs this exact text." />
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
