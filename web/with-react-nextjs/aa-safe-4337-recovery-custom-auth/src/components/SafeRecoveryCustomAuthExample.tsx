"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { EmailSignInContainer } from "@/components/sign-in/EmailSignInContainer";
import { AccountMenu } from "@/components/ui/AccountMenu";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { SmartAccountCell } from "@/components/ui/SmartAccountCell";
import { StepList } from "@/components/ui/StepList";
import { StepPanel } from "@/components/ui/StepPanel";
import { useEmailPasskeyAuth } from "@/hooks/useEmailPasskeyAuth";
import { useGuardianAccount } from "@/hooks/useGuardianAccount";
import { useGuardianFaucet } from "@/hooks/useGuardianFaucet";
import { useParaClient } from "@/hooks/useParaClient";
import { useParaSession } from "@/hooks/useParaSession";
import { useSafeRecovery } from "@/hooks/useSafeRecovery";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatErrorMessage } from "@/lib/format";
import { getSafeFacts, getStepFacts } from "@/lib/recoveryFacts";
import {
  RECOVERY_STEPS,
  getGracePeriodLabel,
  getRecoveryActionAvailability,
  getRecoveryStepDefinitions,
} from "@/lib/recoverySteps";
import type { RecoveryAction } from "@/lib/safeRecoveryState";
import { useAccountMenu } from "@/lib/useAccountMenu";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { useSecondsRemaining } from "@/lib/useSecondsRemaining";
import { useStepProgress } from "@/lib/useStepProgress";

interface StepActionOptions {
  label: string;
  action: RecoveryAction;
  onRun: () => Promise<void>;
  canRun: boolean;
  isComplete?: boolean;
  isRepeatable?: boolean;
}

export function SafeRecoveryCustomAuthExample() {
  const client = useParaClient();
  const session = useParaSession(client.para, client.isReady);
  const auth = useEmailPasskeyAuth({ para: client.para, isReady: client.isReady, onAuthenticated: session.refresh });
  const guardian = useGuardianAccount(client.para, session.address);
  const faucet = useGuardianFaucet(client.para, session.walletId);
  const recovery = useSafeRecovery({ guardianAccount: guardian.account, requestFaucet: faucet.requestFunds });
  const remainingSeconds = useSecondsRemaining(recovery.recoveryExecuteAfter);
  const progress = useStepProgress(getRecoveryStepDefinitions(recovery));
  const addressCopy = useCopyToClipboard();
  const accountMenu = useAccountMenu(session.isConnected);
  const address = session.address ?? "";

  const availability = getRecoveryActionAvailability(recovery, {
    hasGuardian: guardian.account !== null,
    isFaucetPending: faucet.isPending,
    remainingSeconds,
  });

  const header = (
    <ExampleHeader
      scope={EXAMPLE.scope}
      isConnected={session.isConnected}
      address={address}
      onOpenAccount={accountMenu.toggle}
      isAccountOpen={accountMenu.isOpen}
    />
  );

  const footer = <ExampleFooter docsHref={EXAMPLE.docsHref} sourceHref={EXAMPLE.sourceHref} />;

  if (!session.isConnected) {
    return (
      <AppShell header={header} footer={footer}>
        <EmailSignInContainer
          auth={auth}
          isReady={client.isReady}
          errorMessage={auth.errorMessage ?? session.errorMessage ?? client.errorMessage}
          network={SEPOLIA.networkLabel}
        />
      </AppShell>
    );
  }

  const renderAction = ({ label, action, onRun, canRun, isComplete = false, isRepeatable = false }: StepActionOptions) => {
    const isSettled = isComplete && !isRepeatable;

    return (
      <Button
        size="lg"
        variant={isComplete ? "outline" : "primary"}
        disabled={isSettled || !canRun}
        isLoading={recovery.activeAction === action}
        icon={isSettled ? <Icon name="check" className="size-icon-md" /> : undefined}
        onClick={() => void onRun()}>
        {label}
      </Button>
    );
  };

  const restartWithNewSafe = () => {
    progress.restart();
    return recovery.createSafe();
  };

  const stepActions: ReactNode[] = [
    renderAction({
      label: "Create Safe",
      action: "create",
      onRun: recovery.createSafe,
      canRun: availability.canCreateSafe,
      isComplete: Boolean(recovery.createTxHash),
    }),
    renderAction({
      label: "Enable Recovery Module",
      action: "protect",
      onRun: recovery.protectSafe,
      canRun: availability.canProtectSafe,
      isComplete: Boolean(recovery.protectUserOpHash),
    }),
    renderAction({
      label: "Request Faucet Funds",
      action: "fund",
      onRun: recovery.requestGuardianFunds,
      canRun: availability.canRequestFunds,
      isComplete: Boolean(recovery.faucetTxHash),
      isRepeatable: true,
    }),
    renderAction({
      label: "Send Owner Transaction",
      action: "use",
      onRun: recovery.sendOwnerTransaction,
      canRun: availability.canSendOwnerTransaction,
      isComplete: Boolean(recovery.normalTxHash),
      isRepeatable: true,
    }),
    renderAction({
      label: "Run Negative Proof",
      action: "prove",
      onRun: recovery.proveGuardianCannotSpend,
      canRun: availability.canProveGuardianCannotSpend,
      isComplete: Boolean(recovery.negativeProof),
      isRepeatable: true,
    }),
    recovery.cancelTxHash ? (
      renderAction({
        label: "Create Safe",
        action: "create",
        onRun: restartWithNewSafe,
        canRun: availability.canRestart,
      })
    ) : recovery.recoveryTxHash ? (
      <>
        {!recovery.finalizeTxHash &&
          renderAction({
            label: "Veto Recovery",
            action: "veto",
            onRun: recovery.vetoRecovery,
            canRun: availability.canVetoRecovery,
            isComplete: true,
            isRepeatable: true,
          })}
        {renderAction({
          label: "Finalize Recovery",
          action: "finalize",
          onRun: recovery.finalizeRecovery,
          canRun: availability.canFinalizeRecovery,
          isComplete: Boolean(recovery.finalizeTxHash),
        })}
      </>
    ) : (
      renderAction({
        label: "Start Recovery",
        action: "start",
        onRun: recovery.startRecovery,
        canRun: availability.canStartRecovery,
      })
    ),
  ];

  const stepIndex = progress.viewedIndex;
  const step = RECOVERY_STEPS[stepIndex];
  const stepFacts = getStepFacts(stepIndex, recovery);
  const errorMessage = formatErrorMessage(recovery.error?.message ?? null);
  const recoveryDescription = recovery.finalizeTxHash
    ? "Para started recovery, the grace period passed, and the new owner took over."
    : recovery.cancelTxHash
      ? "The current owner vetoed the recovery, so the Safe keeps its owner. Create a new Safe to run the flow again."
      : step.description;

  return (
    <AppShell header={header} footer={footer}>
      <AccountMenu
        isOpen={accountMenu.isOpen}
        onClose={accountMenu.close}
        address={address}
        onCopyAddress={() => addressCopy.copy(address)}
        addressCopyStatus={addressCopy.status}
        onDisconnect={() => void session.disconnect()}
        isDisconnecting={session.isDisconnecting}
      />
      <AccountStrip
        address={address}
        addressLabel="Para guardian"
        onCopyAddress={() => addressCopy.copy(address)}
        addressCopyStatus={addressCopy.status}
        network={SEPOLIA.name}>
        {recovery.safeAddress && (
          <SmartAccountCell
            label="Safe account"
            address={recovery.safeAddress}
            standard="ERC-4337"
            addressTestId="smart-account-address"
          />
        )}
      </AccountStrip>
      <RouteWorkbench
        nav={<StepList variant="rail" heading="Recovery steps" steps={progress.items} />}
        aside={
          <Aside title="Safe">
            <Facts rows={getSafeFacts(recovery, address)} />
          </Aside>
        }>
        <StepPanel
          key={stepIndex}
          eyebrow={`Step ${stepIndex + 1} of ${progress.stepCount}`}
          title={step.title}
          api={step.api}
          description={stepIndex === 5 ? recoveryDescription : step.description}
          hint={recovery.status ?? undefined}
          actions={
            <>
              {stepActions[stepIndex]}
              {progress.nextTitle && (
                <Button size="lg" onClick={progress.goToNext}>
                  {progress.nextTitle}
                </Button>
              )}
            </>
          }>
          {stepIndex === 1 && recovery.moduleProof && (
            <Alert variant="success" title="Guardian registered">
              {recovery.moduleProof}
            </Alert>
          )}
          {stepIndex === 4 && recovery.negativeProof && (
            <Alert
              variant={recovery.negativeProofStatus === "success" ? "success" : "warning"}
              title={recovery.negativeProofStatus === "success" ? "Para cannot spend" : "Unexpected result"}>
              {recovery.negativeProof}
            </Alert>
          )}
          {stepIndex === 5 && recovery.recoveryTxHash && (
            <Countdown label="Grace period" value={getGracePeriodLabel(recovery, remainingSeconds)} />
          )}
          {stepIndex === 5 && recovery.finalizeTxHash && (
            <Alert variant="success" title="Owner recovered">
              The new owner controls the Safe and sent its first transaction.
            </Alert>
          )}
          {stepFacts.length > 0 && <Facts rows={stepFacts} />}
          {errorMessage && (
            <Alert variant="destructive" title="Step failed">
              {errorMessage}
            </Alert>
          )}
        </StepPanel>
      </RouteWorkbench>
    </AppShell>
  );
}
