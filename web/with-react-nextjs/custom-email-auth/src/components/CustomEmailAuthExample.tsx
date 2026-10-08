"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { Workbench } from "@/components/layout/Workbench";
import { EmailSignInContainer } from "@/components/sign-in/EmailSignInContainer";
import { AccountMenu } from "@/components/ui/AccountMenu";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useParaSession } from "@/hooks/useParaSession";
import { useSignHelloWorld } from "@/hooks/useSignHelloWorld";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useAccountMenu } from "@/lib/useAccountMenu";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function CustomEmailAuthExample() {
  const auth = useEmailAuth();
  const session = useParaSession();
  const signing = useSignHelloWorld();
  const balance = useAccountBalance();
  const addressCopy = useCopyToClipboard();
  const signatureCopy = useCopyToClipboard();
  const accountMenu = useAccountMenu(session.isConnected);

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={session.isConnected}
      address={session.address}
      onOpenAccount={accountMenu.toggle}
      isAccountOpen={accountMenu.isOpen}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!session.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <EmailSignInContainer auth={auth} network={SEPOLIA.networkLabel} />
      </AppShell>
    );
  }

  return (
    <AppShell header={header} footer={footer}>
      <AccountMenu
        isOpen={accountMenu.isOpen}
        onClose={accountMenu.close}
        address={session.address}
        onCopyAddress={() => addressCopy.copy(session.address)}
        addressCopyStatus={addressCopy.status}
        onDisconnect={() => session.disconnect()}
        isDisconnecting={session.isDisconnecting}
      />
      <AccountStrip
        address={session.address}
        onCopyAddress={() => addressCopy.copy(session.address)}
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
          api="useParaViemSignMessage()"
          description="Signing proves you control this account. It does not send a transaction or cost gas."
          actions={
            <Button
              size="lg"
              isLoading={signing.isPending}
              onClick={() => signing.sign()}
              data-testid="sign-submit-button">
              {`Sign ${signing.message}`}
            </Button>
          }>
          <TextAreaField label="Message" value={signing.message} readOnly hint="The app signs this exact text." />
        </ActionPanel>
      </Workbench>
    </AppShell>
  );
}
