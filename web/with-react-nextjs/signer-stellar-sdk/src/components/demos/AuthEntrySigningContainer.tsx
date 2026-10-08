"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel, type ResultField } from "@/components/ui/ResultPanel";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { useSignAuthEntry } from "@/hooks/useSignAuthEntry";
import { DEMOS } from "@/lib/demos";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function AuthEntrySigningContainer() {
  const [authEntry, setAuthEntry] = useState("");
  const signing = useSignAuthEntry();
  const entryCopy = useCopyToClipboard();

  const sign = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authEntry.trim()) return;
    await signing.signAuthEntry(authEntry.trim());
  };

  const fields: ResultField[] = signing.signedEntry ? [{ label: "Signed auth entry", value: signing.signedEntry }] : [];

  if (signing.signerAddress) {
    fields.push({ label: "Signer address", value: signing.signerAddress });
  }

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/sign-auth-entry" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: signing.isLoading,
            errorMessage: signing.error?.message,
            value: signing.signedEntry,
          })}
          emptyMessage="The signed auth entry appears here after you sign."
          pendingMessage="Signing the auth entry with Para."
          successLabel="Signed"
          fields={fields}
          onCopy={() => signing.signedEntry && entryCopy.copy(signing.signedEntry)}
          copiedMessage="Signed auth entry copied"
          copyStatus={entryCopy.status}
          errorTitle="Signing failed"
          errorMessage={formatErrorMessage(signing.error?.message ?? null)}
        />
      }>
      <form onSubmit={sign}>
        <ActionPanel
          title="Sign auth entry"
          api="signer.signAuthEntry(authEntry)"
          description="Sign a base64 encoded Soroban authorization entry for a smart contract call."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={signing.isLoading}
              disabled={!authEntry.trim() || !signing.isReady}>
              Sign auth entry
            </Button>
          }>
          <TextAreaField
            label="Auth entry (base64)"
            rows={4}
            value={authEntry}
            onChange={(event) => setAuthEntry(event.target.value)}
            placeholder="Paste a base64 encoded authorization entry"
            autoComplete="off"
            spellCheck={false}
            required
            disabled={signing.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
