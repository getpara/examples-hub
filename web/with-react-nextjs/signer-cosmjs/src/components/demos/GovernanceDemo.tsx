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
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-card-foreground">Governance Voting Demo</h1>
        <p className="mx-auto max-w-2xl text-[13px] font-mono leading-relaxed text-muted-foreground">
          Participate in Cosmos Hub governance by voting on active proposals. Your voting power is
          based on your staked ATOM.
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        {/* Governance Info */}
        <div className="mb-8 rounded-2xl border border-border bg-muted/60">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-card-foreground mb-3">Governance Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Voting Period:</span>{" "}
                <span className="font-medium">14 days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Quorum Required:</span>{" "}
                <span className="font-medium">40%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Pass Threshold:</span>{" "}
                <span className="font-medium">50% (excluding abstain)</span>
              </div>
              <div>
                <span className="text-muted-foreground">Veto Threshold:</span>{" "}
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
            <label htmlFor="proposal" className="block text-sm font-medium text-foreground">
              Select Proposal
            </label>
            <select
              id="proposal"
              value={selectedProposal}
              onChange={(e) => setSelectedProposal(e.target.value)}
              className="field-control"
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
            <div className="rounded-2xl border border-border bg-card">
              <div className="px-6 py-4">
                <h4 className="text-sm font-medium text-card-foreground mb-2">Proposal Description:</h4>
                <p className="text-sm text-muted-foreground">{selectedProposalData.content.description}</p>
              </div>
            </div>
          )}

          <fieldset className="space-y-3">
            <legend className="block text-sm font-medium text-foreground">Your Vote</legend>
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
                    className="h-4 w-4 text-primary focus:ring-primary/25"
                  />
                  <span className="text-sm text-foreground">{getVoteOptionText(option)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <ActionButton
            onClick={handleVote}
            isLoading={isLoading}
            disabled={!isReady || !selectedProposal}
            loadingText="Submitting Vote...">
            Submit Vote
          </ActionButton>

          {txHash && (
            <div className="mt-8 rounded-2xl border border-border bg-card">
              <div className="px-6 py-4 border-b border-border/60 bg-muted/60">
                <h3 className="text-sm font-medium text-card-foreground">Vote Submitted:</h3>
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
