"use client";

import { useAccount } from "@getpara/react-sdk";
import { Card } from "@/components/ui/Card";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { useBalance } from "@/hooks/useBalance";
import { useContractDeployment } from "@/hooks/useContractDeployment";

export default function ContractDeploymentPage() {
  const account = useAccount();
  const { balance, isLoading: isBalanceLoading, refetch, address } = useBalance();
  const { deployContract, deploymentInfo, isLoading, isReady, error, reset } = useContractDeployment();

  const handleDeploy = async () => {
    reset();
    await deployContract();
    await refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Contract Deployment</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Deploy an ERC20 token contract using the Para SDK with ethers.js v6 integration. This demo uses the{" "}
          <code className="font-mono text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-md">ParaTestToken</code>{" "}
          contract implementation.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card title="Current Balance" description="Network: Holesky">
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-900">
              {!address
                ? "Please connect your wallet"
                : isBalanceLoading
                  ? "Loading..."
                  : balance
                    ? `${parseFloat(balance).toFixed(4)} ETH`
                    : "Unable to fetch balance"}
            </p>
            <button
              onClick={refetch}
              disabled={isBalanceLoading || !address}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Refresh balance">
              <span className={`inline-block ${isBalanceLoading ? "animate-spin" : ""}`}>&#8635;</span>
            </button>
          </div>
        </Card>

        {error && <StatusAlert type="error" message={error.message} />}
        {deploymentInfo && <StatusAlert type="success" message="Contract deployed successfully!" />}

        <ActionButton
          onClick={handleDeploy}
          isLoading={isLoading}
          disabled={!isReady || !account?.isConnected}
          loadingText="Deploying Contract...">
          Deploy Contract
        </ActionButton>

        {deploymentInfo && (
          <div className="mt-8 space-y-4">
            <Card title="Contract Address">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {deploymentInfo.contractAddress}
              </p>
              <a
                href={`https://holesky.etherscan.io/address/${deploymentInfo.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </Card>

            <Card title="Transaction Hash">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {deploymentInfo.transactionHash}
              </p>
              <a
                href={`https://holesky.etherscan.io/tx/${deploymentInfo.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-3 py-1 text-sm bg-gray-900 text-white hover:bg-gray-950 transition-colors rounded-none">
                View on Etherscan
              </a>
            </Card>

            <Card title="Contract Bytecode">
              <p className="text-sm font-mono break-all text-gray-600 bg-gray-50 p-4 border border-gray-200">
                {deploymentInfo.deployedBytecode
                  ? `${deploymentInfo.deployedBytecode.slice(0, 128)}...${deploymentInfo.deployedBytecode.slice(-128)}`
                  : ""}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
