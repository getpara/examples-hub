import type { useSafeRecoveryDemo } from "@/hooks/useSafeRecoveryDemo";
import type { ReactNode } from "react";

type Demo = ReturnType<typeof useSafeRecoveryDemo>;

interface RecoveryFlowProps {
  demo: Demo;
}

function HashBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="rounded-xl bg-muted/60 px-4 py-3 animate-fade-in">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <code className="block text-xs font-mono text-muted-foreground break-all leading-relaxed">
        {value}
      </code>
    </div>
  );
}

function AddressBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="rounded-xl bg-muted/60 px-4 py-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-[13px] font-mono break-all leading-relaxed">{value}</p>
    </div>
  );
}

function StepButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-primary w-full px-4 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none">
      {children}
    </button>
  );
}

function StepCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden animate-fade-in-up">
      <div className="px-6 py-4 border-b border-border/60">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
          {eyebrow}
        </p>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-2 text-[13px] font-mono text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </section>
  );
}

export function RecoveryFlow({ demo }: RecoveryFlowProps) {
  const negativeProofClassName =
    demo.negativeProofStatus === "error"
      ? "rounded-xl bg-destructive/8 border border-destructive/15 px-4 py-3 animate-fade-in"
      : "rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in";
  const negativeProofTextClassName =
    demo.negativeProofStatus === "error"
      ? "text-sm text-destructive break-words"
      : "text-sm text-success-foreground";

  return (
    <div className="space-y-4">
      {demo.error && (
        <div className="rounded-2xl border border-destructive/15 bg-destructive/8 px-6 py-4 animate-fade-in">
          <p className="text-sm text-destructive break-words">{demo.error.message}</p>
        </div>
      )}
      {demo.status && (
        <div className="rounded-2xl border border-border bg-muted/60 px-6 py-4 animate-fade-in">
          <p className="text-sm text-muted-foreground">{demo.status}</p>
        </div>
      )}

      <StepCard
        eyebrow="Step 1"
        title="Create the owner-simulated Safe"
        description={`Creates a Safe ${demo.safeVersion} ERC-4337 account on ${demo.chainName}. The primary owner is a local EOA that stands in for the host app passkey signer.`}>
        <StepButton onClick={demo.createSafe} disabled={!demo.canCreateSafe}>
          Create Safe
        </StepButton>
        <AddressBlock label="Simulated replacement owner" value={demo.newOwnerAddress} />
        <HashBlock label="Deployment transaction" value={demo.createTxHash} />
      </StepCard>

      <StepCard
        eyebrow="Step 2"
        title="Add Para as recovery guardian"
        description="The Safe enables the SocialRecoveryModule and registers the Para wallet as a 1-of-1 guardian. Para is not an owner.">
        <StepButton onClick={demo.protectSafe} disabled={!demo.canProtectSafe}>
          Enable Recovery Module
        </StepButton>
        <AddressBlock label="Recovery module" value={demo.recoveryModuleAddress} />
        <AddressBlock label="Para guardian" value={demo.guardianAddress} />
        <HashBlock label="Setup transaction" value={demo.protectUserOpHash} />
        {demo.moduleProof && (
          <div className="rounded-xl bg-success/8 border border-success/15 px-4 py-3 animate-fade-in">
            <p className="text-sm text-success-foreground">{demo.moduleProof}</p>
          </div>
        )}
      </StepCard>

      <StepCard
        eyebrow="Step 3"
        title="Fund the guardian"
        description="Requests Sepolia ETH for the Para wallet with the Para faucet hook. Cooldown or rate-limit errors stay visible in the flow.">
        <StepButton onClick={demo.requestGuardianFunds} disabled={!demo.canRequestFunds}>
          {demo.isFaucetPending ? "Requesting..." : "Request Faucet Funds"}
        </StepButton>
        <HashBlock label="Faucet transaction" value={demo.faucetTxHash} />
      </StepCard>

      <StepCard
        eyebrow="Step 4"
        title="Use the Safe normally"
        description="A normal sponsored user operation is signed by the simulated passkey owner, not by Para.">
        <StepButton onClick={demo.sendNormalTransaction} disabled={!demo.canSendNormalTransaction}>
          Send Owner Transaction
        </StepButton>
        <AddressBlock label="Target" value={demo.burnAddress} />
        <HashBlock label="Owner transaction" value={demo.normalTxHash} />
      </StepCard>

      <StepCard
        eyebrow="Step 5"
        title="Prove Para cannot spend"
        description="The guardian path is constrained to recovery. The Para signer signs an arbitrary Safe transaction simulation, and the Safe rejects it because the signer is not an owner.">
        <StepButton onClick={demo.proveGuardianCannotSpend} disabled={!demo.canProveGuardianCannotSpend}>
          Run Negative Proof
        </StepButton>
        {demo.negativeProof && (
          <div className={negativeProofClassName}>
            <p className={negativeProofTextClassName}>{demo.negativeProof}</p>
          </div>
        )}
      </StepCard>

      <StepCard
        eyebrow="Step 6"
        title="Recover the lost owner"
        description="The host starts recovery with the Para-authenticated guardian signer. The guardian signature only completes after Para user authentication and Para co-signing. The owner can veto during the delay.">
        {demo.guardianFundingMessage && (
          <div className="rounded-xl bg-muted/60 px-4 py-3 animate-fade-in">
            <p className="text-sm text-muted-foreground">{demo.guardianFundingMessage}</p>
          </div>
        )}
        <StepButton onClick={demo.startRecovery} disabled={!demo.canStartRecovery}>
          Start Recovery
        </StepButton>
        <HashBlock label="Recovery transaction" value={demo.recoveryTxHash} />
        {demo.recoveryTxHash && !demo.finalizeTxHash && (
          <div className="rounded-xl bg-muted/60 px-4 py-3 animate-fade-in">
            <p className="text-xs text-muted-foreground mb-1">Grace period</p>
            <p className="text-sm font-mono">
              {demo.cancelTxHash
                ? "Canceled by current owner"
                : `${demo.remainingSeconds}s remaining`}
            </p>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <StepButton onClick={demo.cancelRecovery} disabled={!demo.canCancelRecovery}>
            Veto Recovery
          </StepButton>
          <StepButton onClick={demo.finalizeRecovery} disabled={!demo.canFinalizeRecovery}>
            Finalize Recovery
          </StepButton>
        </div>
        <HashBlock label="Cancel transaction" value={demo.cancelTxHash} />
        <HashBlock label="Finalize transaction" value={demo.finalizeTxHash} />
        <HashBlock label="New owner transaction" value={demo.postRecoveryTxHash} />
      </StepCard>
    </div>
  );
}
