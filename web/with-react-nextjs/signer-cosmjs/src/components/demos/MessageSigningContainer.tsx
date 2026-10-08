"use client";

import { useState } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useMessageSigning } from "@/hooks/useMessageSigning";
import { DEMOS } from "@/lib/demos";
import { SIGN_PENDING_MESSAGE } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function MessageSigningContainer() {
  const [message, setMessage] = useState("Hello from Para + CosmJS!");
  const signing = useMessageSigning();
  const signatureCopy = useCopyToClipboard();

  const sign = async () => {
    signing.reset();
    await signing.signMessage(message).catch(() => undefined);
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
          pendingMessage={SIGN_PENDING_MESSAGE}
          successLabel="Signed"
          fields={
            signing.signature
              ? [
                  { label: "Signature", value: signing.signature },
                  { label: "Signer address", value: signing.address ?? "" },
                ]
              : []
          }
          onCopy={() => signing.signature && signatureCopy.copy(signing.signature)}
          copiedMessage="Signature copied"
          copyStatus={signatureCopy.status}
          errorTitle="Signing failed"
          errorMessage={formatErrorMessage(signing.error?.message ?? null)}
        />
      }>
      <ActionPanel
        title="Message signing"
        api="signingClient.sign(address, [], fee, memo)"
        description="Sign a transaction that carries your message as its memo, without broadcasting it. It does not cost gas."
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
