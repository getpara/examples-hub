"use client";

import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { Facts } from "@/components/ui/Facts";
import { Icon } from "@/components/ui/Icon";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { usePermitSigning } from "@/hooks/usePermitSigning";
import { PARA_TEST_TOKEN } from "@/lib/contracts";
import { DEMOS } from "@/lib/demos";
import { formatReading } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";

export function PermitSigningContainer() {
  const permit = usePermitSigning();
  const signed = permit.signedPermit;

  const sign = async () => {
    permit.reset();
    await permit.signPermit().catch(() => undefined);
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/permit-signing" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: permit.isLoading,
            errorMessage: permit.error?.message,
            value: signed?.r,
          })}
          emptyMessage="The permit values appear here after you sign."
          pendingMessage="Approve the request in the Para window."
          successLabel="Signed"
          fields={
            signed
              ? [
                  { label: "Deadline", value: signed.deadline },
                  { label: "v", value: String(signed.v) },
                  { label: "r", value: signed.r },
                  { label: "s", value: signed.s },
                ]
              : []
          }
          errorTitle="Signing failed"
          errorMessage={formatErrorMessage(permit.error?.message ?? null)}
        />
      }>
      <ActionPanel
        title="Permit signing"
        api="signer._signTypedData(domain, types, permit)"
        description={`Sign an EIP-2612 permit that lets the token owner spend your ${PARA_TEST_TOKEN.symbol}. The permit is valid for one hour and nothing is sent onchain.`}
        actions={
          <>
            <Button size="lg" isLoading={permit.isLoading} disabled={!permit.isReady} onClick={sign}>
              Sign permit
            </Button>
            <Button
              variant="outline"
              size="lg"
              isLoading={permit.isDataLoading}
              onClick={() => void permit.fetchTokenData()}
              icon={<Icon name="refresh" className="size-icon-md" />}>
              Refresh
            </Button>
          </>
        }>
        <Facts
          rows={[
            {
              label: `${PARA_TEST_TOKEN.symbol} balance`,
              value: formatReading(permit.tokenBalance, PARA_TEST_TOKEN.symbol, permit.isDataLoading),
              tone: "data",
            },
            {
              label: "Owner allowance",
              value: formatReading(permit.currentAllowance, PARA_TEST_TOKEN.symbol, permit.isDataLoading),
              tone: "data",
            },
          ]}
        />
      </ActionPanel>
    </RouteWorkbench>
  );
}
