"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { AccountStripWithRefreshTestId } from "@/components/ui/AccountStripWithRefreshTestId";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { Button } from "@/components/ui/Button";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { StepList } from "@/components/ui/StepList";
import { SubmissionResult } from "@/components/ui/SubmissionResult";
import { TextField } from "@/components/ui/TextField";
import { useAmuletBalance } from "@/hooks/useAmuletBalance";
import { useCantonParty } from "@/hooks/useCantonParty";
import { useCantonSubmission } from "@/hooks/useCantonSubmission";
import { useCantonWallet } from "@/hooks/useCantonWallet";
import { formatAmuletBalance } from "@/lib/amulet";
import { ONBOARDING_FACTS, getPartyFacts, getSubmissionFacts } from "@/lib/cantonSteps";
import { CANTON } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useTapForm, useTransferForm } from "@/lib/useAmuletForms";
import { useCantonStepNavigation } from "@/lib/useCantonStepNavigation";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

const SUBMISSION_API = "prepare · verify hash · sign · execute";
const DONE_ICON = <Icon name="check" className="size-icon-md" />;

export function CantonNetworkExample() {
  const wallet = useCantonWallet();
  const party = useCantonParty({ address: wallet.address, walletId: wallet.walletId });
  const signer = { partyId: party.partyId, address: wallet.address, walletId: wallet.walletId };
  const preapproval = useCantonSubmission({ command: "preapproval", ...signer });
  const tap = useCantonSubmission({ command: "tap", ...signer });
  const transfer = useCantonSubmission({ command: "transfer", ...signer });
  const balance = useAmuletBalance(party.partyId);
  const tapForm = useTapForm();
  const transferForm = useTransferForm(party.partyId ?? "");
  const addressCopy = useCopyToClipboard();
  const progress = useCantonStepNavigation({
    partyId: party.partyId,
    preapprovalUpdateId: preapproval.updateId,
    tapUpdateId: tap.updateId,
  });

  const account = party.partyId ?? wallet.address;

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={wallet.isConnected}
      address={account}
      onConnect={wallet.openModal}
      onOpenAccount={wallet.openModal}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!wallet.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <SignInPanel
          title="Onboard onto Canton"
          description="Connect with Para to allocate a Canton external party backed by your Para wallet."
          network={CANTON.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
      </AppShell>
    );
  }

  const nextStepButton = progress.nextTitle && (
    <Button size="lg" icon={<Icon name="arrow-right" className="size-icon-md" />} onClick={progress.goToNext}>
      {progress.nextTitle}
    </Button>
  );

  const previousStepButton = progress.previousTitle && (
    <Button size="lg" variant="outline" onClick={progress.goToPrevious}>
      {progress.previousTitle}
    </Button>
  );

  const panels: ReactNode[] = [
    <ActionPanel
      key="onboard"
      title="Onboard as an external party"
      api="signMessageAsync({ walletId, messageBase64 })"
      description={
        party.partyId
          ? "The party is yours. Install the transfer preapproval next so the party can receive Amulet."
          : "Canton prepares the party, Para signs its hash, and Canton allocates it. You sign once."
      }
      actions={
        <>
          {party.partyId ? (
            <Button size="lg" variant="outline" disabled icon={DONE_ICON} data-testid="canton-onboard-button">
              Onboarded
            </Button>
          ) : (
            <Button
              size="lg"
              isLoading={party.isPending}
              onClick={() => void party.onboard()}
              data-testid="canton-onboard-button">
              Onboard as Canton external party
            </Button>
          )}
          {nextStepButton}
        </>
      }>
      {party.partyId ? (
        <Alert variant="success" title="External party allocated on Canton!">
          The party ID is saved for this wallet.
        </Alert>
      ) : (
        <Facts rows={ONBOARDING_FACTS} />
      )}
    </ActionPanel>,
    <ActionPanel
      key="preapproval"
      title="Install preapproval"
      api={SUBMISSION_API}
      description="Canton prepares a transfer preapproval so other parties can send Amulet to this party. The app checks the prepared hash before Para signs it, then Canton executes it."
      actions={
        <>
          {preapproval.updateId ? (
            <Button size="lg" variant="outline" disabled icon={DONE_ICON} data-testid="canton-preapproval-button">
              Submitted
            </Button>
          ) : (
            <Button
              size="lg"
              isLoading={preapproval.isPending}
              onClick={() => void preapproval.submit()}
              data-testid="canton-preapproval-button">
              Install preapproval
            </Button>
          )}
          {previousStepButton}
          {nextStepButton}
        </>
      }
    />,
    <ActionPanel
      key="tap"
      title="Fund party"
      api={SUBMISSION_API}
      description="The DevNet tap mints test Amulet to this party. The app checks the prepared hash before Para signs it, then Canton executes it."
      actions={
        <>
          <Button
            size="lg"
            isLoading={tap.isPending}
            disabled={!tapForm.canSubmit}
            onClick={() => void tap.submit(tapForm.input)}
            data-testid="canton-tap-button">
            Tap Amulet
          </Button>
          {previousStepButton}
          {nextStepButton}
        </>
      }>
      <TextField
        label="Amount"
        value={tapForm.amount}
        onChange={(event) => tapForm.setAmount(event.target.value)}
        placeholder="100"
        inputMode="decimal"
        trailing={CANTON.currencySymbol}
        disabled={tap.isPending}
        data-testid="canton-tap-amount-input"
      />
    </ActionPanel>,
    <ActionPanel
      key="transfer"
      title="Send Amulet"
      api={SUBMISSION_API}
      description="Canton prepares the transfer. The app checks the prepared hash before Para signs it, then Canton executes it."
      actions={
        <>
          <Button
            size="lg"
            isLoading={transfer.isPending}
            disabled={!transferForm.canSubmit}
            onClick={() => void transfer.submit(transferForm.input)}
            data-testid="canton-send-button">
            Send Amulet
          </Button>
          {previousStepButton}
        </>
      }>
      <TextField
        label="Recipient party ID"
        value={transferForm.receiverPartyId}
        onChange={(event) => transferForm.setReceiverPartyId(event.target.value)}
        placeholder="party::namespace"
        spellCheck={false}
        disabled={transfer.isPending}
        data-testid="canton-send-receiver-input"
      />
      <TextField
        label="Amount"
        value={transferForm.amount}
        onChange={(event) => transferForm.setAmount(event.target.value)}
        placeholder="1.0"
        inputMode="decimal"
        trailing={CANTON.currencySymbol}
        disabled={transfer.isPending}
        data-testid="canton-send-amount-input"
      />
      <TextField
        label="Memo (optional)"
        value={transferForm.memo}
        onChange={(event) => transferForm.setMemo(event.target.value)}
        placeholder="Add a note"
        disabled={transfer.isPending}
        data-testid="canton-send-memo-input"
      />
    </ActionPanel>,
  ];

  const onboardingError = formatErrorMessage(party.errorMessage);

  const asides: ReactNode[] = [
    <Aside key="onboard" title="Result">
      {onboardingError && (
        <Alert variant="destructive" title="Onboarding failed">
          {onboardingError}
        </Alert>
      )}
      <Facts rows={getPartyFacts(party.partyId, party.multiHash)} />
    </Aside>,
    <SubmissionResult
      key="preapproval"
      status={getResultStatus({ isPending: preapproval.isPending, errorMessage: preapproval.errorMessage, value: preapproval.updateId })}
      emptyMessage="The update ID appears here after Canton accepts the preapproval."
      successTitle="Preapproval submitted"
      successMessage="The validator accepts the proposal shortly."
      errorTitle="Preapproval failed"
      errorMessage={formatErrorMessage(preapproval.errorMessage)}
      facts={getSubmissionFacts(preapproval.preparedHash, preapproval.updateId, "canton-preapproval-update-id-display")}
    />,
    <SubmissionResult
      key="tap"
      status={getResultStatus({ isPending: tap.isPending, errorMessage: tap.errorMessage, value: tap.updateId })}
      emptyMessage="The update ID appears here after Canton accepts the tap."
      successTitle="Tap confirmed"
      successMessage="The party now holds Amulet it can spend."
      errorTitle="Tap failed"
      errorMessage={formatErrorMessage(tap.errorMessage)}
      facts={getSubmissionFacts(tap.preparedHash, tap.updateId, "canton-tap-update-id-display")}
    />,
    <SubmissionResult
      key="transfer"
      status={getResultStatus({ isPending: transfer.isPending, errorMessage: transfer.errorMessage, value: transfer.updateId })}
      emptyMessage="The update ID appears here after Canton accepts the transfer."
      successTitle="Transfer submitted"
      successMessage="Canton accepted the signed transaction."
      errorTitle="Transfer failed"
      errorMessage={formatErrorMessage(transfer.errorMessage)}
      facts={getSubmissionFacts(transfer.preparedHash, transfer.updateId, "canton-send-update-id-display")}
    />,
  ];

  return (
    <AppShell header={header} footer={footer}>
      <AccountStripWithRefreshTestId
        address={account || "No Solana wallet"}
        addressLabel={party.partyId ? "Canton party" : "Para wallet"}
        addressTestId={party.partyId ? "canton-party-id-display" : undefined}
        onCopyAddress={account ? () => addressCopy.copy(account) : undefined}
        addressCopyStatus={addressCopy.status}
        network={CANTON.name}
        balanceLabel="Amulet balance"
        balance={formatAmuletBalance({
          hasParty: Boolean(party.partyId),
          amount: balance.amount,
          errorMessage: balance.errorMessage,
        })}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={party.partyId ? () => void balance.refresh() : undefined}
        refreshBalanceTestId="canton-balance-refresh"
      />
      <RouteWorkbench
        nav={<StepList variant="rail" heading="Canton" steps={progress.items} />}
        aside={asides[progress.viewedIndex]}>
        {panels[progress.viewedIndex]}
      </RouteWorkbench>
    </AppShell>
  );
}
