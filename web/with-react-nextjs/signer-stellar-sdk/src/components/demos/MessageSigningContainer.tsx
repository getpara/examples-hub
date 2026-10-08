"use client";

import { useState } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useMessageSigning } from "@/hooks/useMessageSigning";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function MessageSigningContainer() {
  const [message, setMessage] = useState("Hello from Para + Stellar!");
  const signing = useMessageSigning();
  const signatureCopy = useCopyToClipboard();

  const sign = async () => {
    signing.reset();
    await signing.signMessage(message);
  };

  const verify = async () => {
    await signing.verifySignature(message);
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/sign-message" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: signing.isLoading,
            errorMessage: signing.error?.message,
            value: signing.signature,
          })}
          emptyMessage="The signature appears here after you sign."
          pendingMessage="Signing the message with Para."
          successLabel={signing.isVerified ? "Verified" : "Signed"}
          fields={
            signing.signature ? [{ label: "Signature", value: signing.signature, testId: "sign-signature-display" }] : []
          }
          onCopy={() => signing.signature && signatureCopy.copy(signing.signature)}
          copiedMessage="Signature copied"
          copyStatus={signatureCopy.status}
          errorTitle="Signing failed"
          errorMessage={formatErrorMessage(signing.error?.message ?? null)}>
          {signing.signature && !signing.error && signing.isVerified === null && (
            <Button variant="outline" className="justify-self-start" onClick={verify}>
              Verify signature
            </Button>
          )}
          {signing.isVerified === false && !signing.error && (
            <Alert variant="destructive" title="Verification failed">
              Invalid signature for this message and public key.
            </Alert>
          )}
        </ResultPanel>
      }>
      <ActionPanel
        title="Sign message"
        api="signer.signBytes(bytes)"
        description="Sign text with the Para Stellar signer, then verify the Ed25519 signature against the account's public key."
        actions={
          <Button
            size="lg"
            isLoading={signing.isLoading}
            disabled={!message.trim() || !signing.isReady}
            onClick={sign}
            data-testid="sign-submit-button">
            Sign message
          </Button>
        }>
        <TextAreaField
          label="Message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Enter a message to sign"
          required
          disabled={signing.isLoading}
          data-testid="sign-message-input"
        />
      </ActionPanel>
    </RouteWorkbench>
  );
}
