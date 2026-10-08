"use client";

import { useState } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SelectField } from "@/components/ui/SelectField";
import { useTypedDataSigning } from "@/hooks/useTypedDataSigning";
import {
  ATTESTATION_PURPOSES,
  ATTESTATION_PURPOSE_OPTIONS,
  isAttestationPurpose,
  type AttestationPurpose,
} from "@/lib/attestationPurposes";
import { PARA_TEST_TOKEN } from "@/lib/contracts";
import { DEMOS } from "@/lib/demos";
import { formatReading, formatUnixTimestamp } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function TypedDataSigningContainer() {
  const [purpose, setPurpose] = useState<AttestationPurpose>(ATTESTATION_PURPOSES[0]);
  const typedData = useTypedDataSigning();
  const signatureCopy = useCopyToClipboard();
  const attestation = typedData.attestation;

  const selectPurpose = (value: string) => {
    if (isAttestationPurpose(value)) {
      setPurpose(value);
    }
  };

  const sign = async () => {
    typedData.reset();
    await typedData.signAttestation(purpose).catch(() => undefined);
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/typed-data-signing" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: typedData.isLoading,
            errorMessage: typedData.error?.message,
            value: typedData.signature,
          })}
          emptyMessage="The signed attestation appears here after you sign."
          pendingMessage="Approve the request in the Para window."
          successLabel="Signed"
          fields={
            attestation && typedData.signature
              ? [
                  { label: "Holder", value: attestation.holder },
                  { label: "Balance", value: `${attestation.balance} ${PARA_TEST_TOKEN.symbol}` },
                  { label: "Purpose", value: attestation.purpose },
                  { label: "Timestamp", value: formatUnixTimestamp(attestation.timestamp) },
                  { label: "Nonce", value: String(attestation.nonce) },
                  { label: "Signature", value: typedData.signature },
                ]
              : []
          }
          copyLabel="Copy signature"
          onCopy={() => typedData.signature && signatureCopy.copy(typedData.signature)}
          copiedMessage="Signature copied"
          copyStatus={signatureCopy.status}
          errorTitle="Signing failed"
          errorMessage={formatErrorMessage(typedData.error?.message ?? null)}
        />
      }>
      <ActionPanel
        title="Typed data signing"
        api="signer._signTypedData(domain, types, value)"
        description={`Sign an EIP-712 attestation about your ${PARA_TEST_TOKEN.symbol} balance. Any EIP-712 verifier can check it offchain.`}
        actions={
          <>
            <Button size="lg" isLoading={typedData.isLoading} disabled={!typedData.isReady} onClick={sign}>
              Sign attestation
            </Button>
            <Button
              variant="outline"
              size="lg"
              isLoading={typedData.isBalanceLoading}
              onClick={() => void typedData.fetchTokenData()}
              icon={<Icon name="refresh" className="size-icon-md" />}>
              Refresh balance
            </Button>
          </>
        }>
        <Facts
          rows={[
            {
              label: `${PARA_TEST_TOKEN.symbol} balance`,
              value: formatReading(typedData.tokenBalance, PARA_TEST_TOKEN.symbol, typedData.isBalanceLoading),
              tone: "data",
            },
          ]}
        />
        <SelectField
          label="Purpose"
          options={ATTESTATION_PURPOSE_OPTIONS}
          value={purpose}
          onChange={(event) => selectPurpose(event.target.value)}
          disabled={typedData.isLoading}
        />
      </ActionPanel>
    </RouteWorkbench>
  );
}
