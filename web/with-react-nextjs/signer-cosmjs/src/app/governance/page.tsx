"use client";

import { useState, useEffect } from "react";
import { useAccount } from "@getpara/react-sdk";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useCosmosQueryClient } from "@/hooks/useCosmosQueryClient";
import { useAccountAddress } from "@/hooks/useAccountAddress";
import { MsgVoteEncodeObject } from "@cosmjs/stargate";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";

interface Proposal {
  proposalId: string;
  content: {
    title: string;
    description: string;
  };
  status: string;
  votingEndTime: string;
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState("");
  const [voteOption, setVoteOption] = useState<VoteOption>(VoteOption.VOTE_OPTION_YES);
  const [isLoading, setIsLoading] = useState(false);
  const [isProposalsLoading, setIsProposalsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error" | "info";
    message: string;
  }>({ show: false, type: "success", message: "" });

  const account = useAccount();
  const { signingClient } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();
  const address = useAccountAddress();

  const fetchProposals = async () => {
    if (!queryClient) return;

    setIsProposalsLoading(true);
    try {
      // Note: This is a simplified example. In reality, you'd need to handle pagination
      // and filter for active proposals
      const response = await (queryClient as any).gov.proposals(
        2, // ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
        "",
        ""
      );
      setProposals(response.proposals.slice(0, 5)); // Show up to 5 active proposals
    } catch (error) {
      console.error("Error fetching proposals:", error);
      // For demo purposes, show mock proposals if the query fails
      setProposals([
        {
          proposalId: "1",
          content: {
            title: "Example Proposal: Increase Block Size",
            description: "This proposal aims to increase the block size to improve throughput.",
          },
          status: "PROPOSAL_STATUS_VOTING_PERIOD",
          votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setIsProposalsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [queryClient]); // eslint-disable-line react-hooks/exhaustive-deps

  const vote = async () => {
    setIsLoading(true);
    setStatus({ show: false, type: "success", message: "" });
    setTxHash(null);

    try {
      if (!account?.isConnected || !address) {
        throw new Error("Please connect your wallet to vote.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!selectedProposal) {
        throw new Error("Please select a proposal to vote on.");
      }

      setStatus({
        show: true,
        type: "info",
        message: "Please confirm your vote in your wallet...",
      });

      const voteMsg: MsgVoteEncodeObject = {
        typeUrl: "/cosmos.gov.v1beta1.MsgVote",
        value: MsgVote.fromPartial({
          proposalId: BigInt(selectedProposal),
          voter: address,
          option: voteOption,
        }),
      };

      const result = await signingClient.signAndBroadcast(
        address,
        [voteMsg],
        "auto",
        "Governance vote via Para + CosmJS"
      );

      setTxHash(result.transactionHash);
      setStatus({
        show: true,
        type: "success",
        message: `Vote submitted successfully! Gas used: ${result.gasUsed}`,
      });
    } catch (error) {
      console.error("Error voting:", error);
      setStatus({
        show: true,
        type: "error",
        message: error instanceof Error ? error.message : "Failed to submit vote. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVoteOptionText = (option: VoteOption) => {
    switch (option) {
      case VoteOption.VOTE_OPTION_YES:
        return "Yes";
      case VoteOption.VOTE_OPTION_NO:
        return "No";
      case VoteOption.VOTE_OPTION_ABSTAIN:
        return "Abstain";
      case VoteOption.VOTE_OPTION_NO_WITH_VETO:
        return "No with Veto";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Governance Voting Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Participate in Cosmos Hub governance by voting on active proposals. Your voting power is based on your staked ATOM.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <div className="mb-8 rounded-none border border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Governance Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Voting Period:</span>{" "}
                <span className="font-medium">14 days</span>
              </div>
              <div>
                <span className="text-gray-600">Quorum Required:</span>{" "}
                <span className="font-medium">40%</span>
              </div>
              <div>
                <span className="text-gray-600">Pass Threshold:</span>{" "}
                <span className="font-medium">50% (excluding abstain)</span>
              </div>
              <div>
                <span className="text-gray-600">Veto Threshold:</span>{" "}
                <span className="font-medium">33.4%</span>
              </div>
            </div>
          </div>
        </div>

        {status.show && (
          <div
            className={`mb-4 rounded-none border ${
              status.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : status.type === "error"
                ? "bg-red-50 border-red-500 text-red-700"
                : "bg-gray-50 border-gray-500 text-gray-700"
            }`}>
            <p className="px-6 py-4 break-words">{status.message}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label
              htmlFor="proposal"
              className="block text-sm font-medium text-gray-700">
              Select Proposal
            </label>
            <select
              id="proposal"
              value={selectedProposal}
              onChange={(e) => setSelectedProposal(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 outline-none transition-colors rounded-none"
              disabled={isProposalsLoading}>
              <option value="">
                {isProposalsLoading ? "Loading proposals..." : "Choose a proposal"}
              </option>
              {proposals.map((proposal) => (
                <option key={proposal.proposalId} value={proposal.proposalId}>
                  #{proposal.proposalId} - {proposal.content.title}
                </option>
              ))}
            </select>
          </div>

          {selectedProposal && proposals.find(p => p.proposalId === selectedProposal) && (
            <div className="rounded-none border border-gray-200 bg-white">
              <div className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Proposal Description:</h4>
                <p className="text-sm text-gray-600">
                  {proposals.find(p => p.proposalId === selectedProposal)?.content.description}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Your Vote
            </label>
            <div className="space-y-2">
              {[
                VoteOption.VOTE_OPTION_YES,
                VoteOption.VOTE_OPTION_NO,
                VoteOption.VOTE_OPTION_ABSTAIN,
                VoteOption.VOTE_OPTION_NO_WITH_VETO,
              ].map((option) => (
                <label key={option} className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="voteOption"
                    value={option}
                    checked={voteOption === option}
                    onChange={() => setVoteOption(option)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-500"
                  />
                  <span className="text-sm text-gray-700">{getVoteOptionText(option)}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={vote}
            className="w-full rounded-none bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !account?.isConnected || !selectedProposal}>
            {isLoading ? "Submitting Vote..." : "Submit Vote"}
          </button>

          {txHash && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Vote Submitted:</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                    <p className="text-sm font-mono bg-white p-4 border border-gray-200 break-all">
                      {txHash}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Your Vote:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {getVoteOptionText(voteOption)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}