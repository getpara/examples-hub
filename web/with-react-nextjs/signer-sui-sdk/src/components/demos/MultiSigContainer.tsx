"use client";

import { useState } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useSuiMultiSig } from "@/hooks/useSuiMultiSig";
import { useSuiWalletConnection } from "@/hooks/useSuiWalletConnection";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage, shortenAddress } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function MultiSigContainer() {
  const [message, setMessage] = useState("Hello from Para + Sui multisig!");
  const wallet = useSuiWalletConnection();
  const multiSig = useSuiMultiSig();
  const signatureCopy = useCopyToClipboard();

  const sign = async () => {
    multiSig.reset();
    await multiSig.sign(message);
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/multisig" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: multiSig.isLoading,
            errorMessage: multiSig.error?.message,
            value: multiSig.combinedSignature,
          })}
          emptyMessage="The combined multisig signature appears here."
          pendingMessage="Signing with both members."
          successLabel={multiSig.isVerified ? "Verified" : "Signed"}
          fields={
            multiSig.combinedSignature
              ? [{ label: "Signature", value: multiSig.combinedSignature, testId: "multisig-signature-display" }]
              : []
          }
          onCopy={() => multiSig.combinedSignature && signatureCopy.copy(multiSig.combinedSignature)}
          copiedMessage="Signature copied"
          copyStatus={signatureCopy.status}
          errorTitle="Signing failed"
          errorMessage={formatErrorMessage(multiSig.error?.message ?? null)}>
          {multiSig.isVerified === false && !multiSig.error && (
            <Alert variant="destructive" title="Verification failed">
              The combined signature did not verify.
            </Alert>
          )}
        </ResultPanel>
      }>
      <ActionPanel
        title="Native multisig"
        api="useParaSuiMultiSigSigner()"
        description="A 2-of-2 Sui multisig: your Para wallet is one member and a key made in this browser is the other."
        actions={
          <Button
            size="lg"
            isLoading={multiSig.isLoading}
            disabled={!message.trim() || !multiSig.isReady}
            onClick={sign}
            data-testid="multisig-sign-button">
            Sign & Combine
          </Button>
        }>
        <Facts
          rows={[
            { label: "Threshold", value: `${multiSig.threshold} of 2, each weight 1` },
            {
              label: "Multisig address",
              value: multiSig.multiSigAddress ? shortenAddress(multiSig.multiSigAddress) : "Deriving",
              title: multiSig.multiSigAddress ?? undefined,
              tone: "mono",
            },
            {
              label: "Member 1",
              value: `Para wallet ${shortenAddress(wallet.address)}`,
              title: wallet.address,
              tone: "mono",
            },
            {
              label: "Member 2",
              value: multiSig.coSignerAddress ? `Browser key ${shortenAddress(multiSig.coSignerAddress)}` : "Generating",
              title: multiSig.coSignerAddress ?? undefined,
              tone: "mono",
            },
          ]}
        />
        <TextAreaField
          label="Message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Enter a message for both members to sign"
          hint="Both members sign; the app combines the signatures."
          required
          disabled={multiSig.isLoading}
          data-testid="multisig-message-input"
        />
      </ActionPanel>
    </RouteWorkbench>
  );
}
