"use client";

import { useState } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel, type ResultField } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useMessageSigning } from "@/hooks/useMessageSigning";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function MessageSigningContainer() {
  const [message, setMessage] = useState("Hello from Para + Ethers v5!");
  const signing = useMessageSigning();
  const signatureCopy = useCopyToClipboard();

  const sign = async () => {
    signing.reset();
    await signing.signMessage(message).catch(() => undefined);
  };

  const verify = async () => {
    if (signing.signature) {
      await signing.verifySignature(message, signing.signature).catch(() => undefined);
    }
  };

  const fields: ResultField[] = signing.signature ? [{ label: "Signature", value: signing.signature }] : [];

  if (signing.recoveredAddress) {
    fields.push({ label: "Recovered address", value: signing.recoveredAddress });
  }

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
          successLabel={signing.recoveredAddress ? "Verified" : "Signed"}
          fields={fields}
          onCopy={() => signing.signature && signatureCopy.copy(signing.signature)}
          copiedMessage="Signature copied"
          copyStatus={signatureCopy.status}
          errorTitle={signing.signature ? "Verification failed" : "Signing failed"}
          errorMessage={formatErrorMessage(signing.error?.message ?? null)}>
          {signing.signature && !signing.error && !signing.recoveredAddress && (
            <Button variant="outline" className="justify-self-start" onClick={verify}>
              Verify signature
            </Button>
          )}
        </ResultPanel>
      }>
      <ActionPanel
        title="Message signing"
        api="signer.signMessage(message)"
        description="Sign a message with the ethers signer to prove you control this account. It does not send a transaction or cost gas."
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
