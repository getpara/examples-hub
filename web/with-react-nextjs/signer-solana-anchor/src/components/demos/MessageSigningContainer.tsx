"use client";

import { useState } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultActions } from "@/components/ui/ResultActions";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useMessageSigning } from "@/hooks/useMessageSigning";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function MessageSigningContainer() {
  const [message, setMessage] = useState("Hello from Para + Anchor!");
  const signing = useMessageSigning();
  const signatureCopy = useCopyToClipboard();

  const sign = async () => {
    signing.reset();
    await signing.signMessage(message);
  };

  const verify = async () => {
    if (signing.signature) {
      await signing.verifySignature(message, signing.signature);
    }
  };

  const status = getResultStatus({
    isPending: signing.isLoading,
    errorMessage: signing.error?.message,
    value: signing.signature,
  });

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/message-signing" />}
      aside={
        <ResultPanel
          status={status}
          emptyMessage="The signature appears here after you sign."
          pendingMessage="Approve the request in the Para window."
          successLabel={signing.isVerified ? "Verified" : "Signed"}
          fields={signing.signature ? [{ label: "Signature", value: signing.signature }] : []}
          errorTitle={signing.signature ? "Verification failed" : "Signing failed"}
          errorMessage={formatErrorMessage(signing.error?.message ?? null)}>
          {status === "success" && signing.signature && (
            <ResultActions>
              <CopyButton
                label="Copy"
                copiedMessage="Signature copied"
                status={signatureCopy.status}
                onCopy={() => signing.signature && signatureCopy.copy(signing.signature)}
              />
              {!signing.isVerified && (
                <Button variant="outline" size="sm" onClick={verify}>
                  Verify
                </Button>
              )}
            </ResultActions>
          )}
        </ResultPanel>
      }>
      <ActionPanel
        title="Message signing"
        api="signer.signBytes(message)"
        description="Sign a message with the Para Solana signer to prove you control this account. It does not send a transaction or cost fees."
        actions={
          <Button
            size="lg"
            isLoading={signing.isLoading}
            disabled={!message.trim() || !signing.isReady}
            onClick={sign}>
            Sign message
          </Button>
        }>
        <TextAreaField
          label="Message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Enter a message to sign"
          disabled={signing.isLoading}
        />
      </ActionPanel>
    </RouteWorkbench>
  );
}
