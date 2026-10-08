"use client";

import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { useAccountBalance } from "@/hooks/useAccountBalance";
import { useContractDeployment } from "@/hooks/useContractDeployment";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { HOLESKY, explorerAddressUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { previewBytecode } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";

export function ContractDeploymentContainer() {
  const wallet = useEvmWalletConnection();
  const balance = useAccountBalance(wallet.address);
  const deployment = useContractDeployment();
  const addressCopy = useCopyToClipboard();
  const info = deployment.deploymentInfo;

  const deploy = async () => {
    deployment.reset();

    try {
      await deployment.deployContract();
    } catch {
      return;
    }

    await balance.refresh();
  };

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/contract-deployment" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: deployment.isLoading,
            errorMessage: deployment.error?.message,
            value: info?.contractAddress,
          })}
          emptyMessage="The contract address appears here after you deploy."
          pendingMessage={`Approve the request in the Para window, then wait for ${HOLESKY.name} to confirm.`}
          successLabel="Deployed"
          fields={
            info
              ? [
                  { label: "Contract address", value: info.contractAddress },
                  { label: "Transaction hash", value: info.transactionHash },
                  { label: "Bytecode preview", value: previewBytecode(info.deployedBytecode) },
                ]
              : []
          }
          copyLabel="Copy address"
          onCopy={() => info && addressCopy.copy(info.contractAddress)}
          copiedMessage="Contract address copied"
          copyStatus={addressCopy.status}
          explorerHref={info ? explorerAddressUrl(info.contractAddress) : undefined}
          explorerLabel={`View on ${HOLESKY.explorerName}`}
          errorTitle="Deployment failed"
          errorMessage={formatErrorMessage(deployment.error?.message ?? null)}
        />
      }>
      <ActionPanel
        title="Contract deployment"
        api="factory.deploy()"
        description="Deploy your own copy of the ParaTestToken ERC20 contract with the ethers signer."
        hint="Gas is paid from this account."
        actions={
          <Button size="lg" isLoading={deployment.isLoading} disabled={!deployment.isReady} onClick={deploy}>
            Deploy contract
          </Button>
        }
      />
    </RouteWorkbench>
  );
}
