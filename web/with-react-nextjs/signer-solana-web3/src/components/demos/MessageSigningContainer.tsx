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
  const [message, setMessage] = useState("Hello from Para + web3.js!");
  const signing = useMessageSigning();
  const signatureCopy = useCopyToClipboard();

  const sign = async () => {
    signing.reset();
    await signing.signMessage(message);
  };

  const verify = async () => {
    if (signing.signature) {
      await signing.verifySignature(message);
    }
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/message-signing" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: signing.isLoading,
            errorMessage: signing.error?.message,
            value: signing.signature,
          })}
          emptyMessage="The signature appears here after you sign."
          pendingMessage="Approve the request in the Para window."
          successLabel={signing.isVerified ? "Verified" : "Signed"}
          fields={signing.signature ? [{ label: "Signature", value: signing.signature }] : []}
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
        title="Message signing"
        api="signer.signBytes(message)"
        description="Sign a message with the web3.js signer, then verify the signature against the wallet's public key. It does not send a transaction or cost fees."
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
