"use client";

import { useState } from "react";
import { useGovernance, getVoteOptionText, VoteOption } from "@/hooks/useGovernance";
import { StatusAlert } from "@/components/ui/StatusAlert";
import { ActionButton } from "@/components/ui/ActionButton";
import { DataField } from "@/components/ui/DataField";

export default function GovernancePage() {
  const [selectedProposal, setSelectedProposal] = useState("");
  const [voteOption, setVoteOption] = useState<VoteOption>(VoteOption.VOTE_OPTION_YES);

  const {
    vote,
    proposals,
    txHash,
    gasUsed,
    isLoading,
    isProposalsLoading,
    isReady,
    error,
    reset,
  } = useGovernance();

  const handleVote = async () => {
    reset();
    await vote(selectedProposal, voteOption);
  };

  const selectedProposalData = proposals.find((p) => p.proposalId === selectedProposal);

  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Governance Voting Demo</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Participate in Cosmos Hub governance by voting on active proposals. Your voting power is
          based on your staked ATOM.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* Governance Info */}
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

        {error && <StatusAlert type="error" message={error.message} />}
        {txHash && (
          <StatusAlert type="success" message={`Vote submitted successfully! Gas used: ${gasUsed}`} />
        )}

        <div className="space-y-4">
          <div className="space-y-3">
            <label htmlFor="proposal" className="block text-sm font-medium text-gray-700">
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

          {selectedProposalData && (
            <div className="rounded-none border border-gray-200 bg-white">
              <div className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Proposal Description:</h4>
                <p className="text-sm text-gray-600">{selectedProposalData.content.description}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Your Vote</label>
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

          <ActionButton
            onClick={handleVote}
            isLoading={isLoading}
            disabled={!isReady || !selectedProposal}
            loadingText="Submitting Vote...">
            Submit Vote
          </ActionButton>

          {txHash && (
            <div className="mt-8 rounded-none border border-gray-200">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Vote Submitted:</h3>
              </div>
              <div className="p-6 space-y-4">
                <DataField label="Transaction Hash:" value={txHash} mono />
                <DataField label="Your Vote:" value={getVoteOptionText(voteOption)} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
