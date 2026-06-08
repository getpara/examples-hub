"use client";

import { Card } from "@/components/ui/Card";
import { DataField } from "@/components/ui/DataField";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { useEvmWalletConnection } from "@/hooks/useEvmWalletConnection";
import { useBalance } from "@/hooks/useBalance";
import { useContractDeployment } from "@/hooks/useContractDeployment";

export default function ContractDeploymentDemo() {
  const wallet = useEvmWalletConnection();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { deployContract, deploymentInfo, isLoading, isReady, error, reset } = useContractDeployment();

  const handleDeploy = async () => {
    reset();
    await deployContract();
    await refetch();
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Contract Deployment Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Deploy an ERC20 token contract using the Para SDK with ethers.js v6 integration. This demo uses the{" "}
          <code className="rounded-md bg-muted px-2 py-1 text-xs text-foreground">ParaTestToken</code>{" "}
          contract implementation.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <Card title="Current Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-card-foreground">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${parseFloat(balance).toFixed(4)} ETH`
                    : "Unable to fetch balance"}
            </p>
            <button
              type="button"
              onClick={refetch}
              disabled={isBalanceLoading || !address}
              className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-50"
              title="Refresh balance">
              {isBalanceLoading ? "Loading" : "Refresh"}
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {deploymentInfo && <StatusAlert type="success" message="Contract deployed successfully!" />}

        <ActionButton
          onClick={handleDeploy}
          isLoading={isLoading}
          disabled={!isReady || !wallet.isConnected}
          loadingText="Deploying Contract...">
          Deploy Contract
        </ActionButton>

        {deploymentInfo && (
          <div className="mt-8 space-y-4">
            <Card title="Contract Address">
              <DataField label="Contract Address" value={deploymentInfo.contractAddress} mono />
              <a
                href={`https://holesky.etherscan.io/address/${deploymentInfo.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 inline-block px-4 py-2 text-sm">
                View on Etherscan
              </a>
            </Card>

            <Card title="Transaction Hash">
              <DataField label="Transaction Hash" value={deploymentInfo.transactionHash} mono />
              <a
                href={`https://holesky.etherscan.io/tx/${deploymentInfo.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 inline-block px-4 py-2 text-sm">
                View on Etherscan
              </a>
            </Card>

            <Card title="Contract Bytecode">
              <DataField
                label="Bytecode Preview"
                value={
                  deploymentInfo.deployedBytecode
                    ? `${deploymentInfo.deployedBytecode.slice(0, 128)}...${deploymentInfo.deployedBytecode.slice(-128)}`
                    : ""
                }
                mono
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
