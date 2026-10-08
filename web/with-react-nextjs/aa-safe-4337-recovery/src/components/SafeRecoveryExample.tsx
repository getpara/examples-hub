"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ExampleFooter } from "@/components/layout/ExampleFooter";
import { ExampleHeader } from "@/components/layout/ExampleHeader";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { AccountStrip } from "@/components/ui/AccountStrip";
import { Alert } from "@/components/ui/Alert";
import { Aside } from "@/components/ui/Aside";
import { Button } from "@/components/ui/Button";
import { Countdown } from "@/components/ui/Countdown";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { SignInPanel } from "@/components/ui/SignInPanel";
import { SmartAccountCell } from "@/components/ui/SmartAccountCell";
import { StepList } from "@/components/ui/StepList";
import { StepPanel } from "@/components/ui/StepPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useGuardianAccount } from "@/hooks/useGuardianAccount";
import { useGuardianFaucet } from "@/hooks/useGuardianFaucet";
import { useParaModalWallet } from "@/hooks/useParaModalWallet";
import { useSafeRecovery } from "@/hooks/useSafeRecovery";
import { SEPOLIA } from "@/lib/chain";
import { EXAMPLE } from "@/lib/example";
import { formatBalance, formatErrorMessage } from "@/lib/format";
import { getSafeFacts, getStepFacts } from "@/lib/recoveryFacts";
import {
  RECOVERY_STEPS,
  getGracePeriodLabel,
  getRecoveryActionAvailability,
  getRecoveryStepDefinitions,
} from "@/lib/recoverySteps";
import type { RecoveryAction } from "@/lib/safeRecoveryState";
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

export function SafeRecoveryExample() {
  const wallet = useParaModalWallet();
  const balance = useAccountBalance();
  const guardian = useGuardianAccount();
  const faucet = useGuardianFaucet();
  const recovery = useSafeRecovery({ guardianAccount: guardian.account, requestFaucet: faucet.requestFunds });
  const remainingSeconds = useSecondsRemaining(recovery.recoveryExecuteAfter);
  const progress = useStepProgress(getRecoveryStepDefinitions(recovery));
  const addressCopy = useCopyToClipboard();

  const availability = getRecoveryActionAvailability(recovery, {
    hasGuardian: guardian.account !== null,
    isFaucetPending: faucet.isPending,
    remainingSeconds,
  });

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
          title="Recover a Safe account"
          description="Connect with Para to act as the recovery guardian for a Safe ERC-4337 account."
          network={SEPOLIA.networkLabel}>
          <Button size="lg" fullWidth onClick={() => wallet.openModal()} data-testid="auth-connect-button">
            Connect with Para
          </Button>
        </SignInPanel>
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
  const needsGuardian = stepIndex > 0 && stepIndex !== 3 && guardian.isLoading;
  const recoveryDescription = recovery.finalizeTxHash
    ? "Para started recovery, the grace period passed, and the new owner took over."
    : recovery.cancelTxHash
      ? "The current owner vetoed the recovery, so the Safe keeps its owner. Create a new Safe to run the flow again."
      : step.description;

  return (
    <AppShell header={header} footer={footer}>
      <AccountStrip
        address={wallet.address}
        addressLabel="Para guardian"
        onCopyAddress={() => addressCopy.copy(wallet.address)}
        addressCopyStatus={addressCopy.status}
        network={SEPOLIA.name}
        balance={formatBalance(balance.balance, SEPOLIA.currencySymbol)}
        isBalanceLoading={balance.isLoading}
        isBalanceRefreshing={balance.isRefreshing}
        onRefreshBalance={balance.refresh}>
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
            <Facts rows={getSafeFacts(recovery, wallet.address)} />
          </Aside>
        }>
        <StepPanel
          key={stepIndex}
          eyebrow={`Step ${stepIndex + 1} of ${progress.stepCount}`}
          title={step.title}
          api={step.api}
          description={stepIndex === 5 ? recoveryDescription : step.description}
          hint={recovery.status ?? (needsGuardian ? "Loading the Para guardian account." : undefined)}
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
