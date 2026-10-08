import { useState, useEffect, useCallback } from "react";
import type { MsgVoteEncodeObject } from "@cosmjs/stargate";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { ProposalStatus, TextProposal, type Proposal, type VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { useParaSigner } from "@/hooks/useParaSigner";
import { useCosmosQueryClient } from "@/hooks/useCosmosQueryClient";

export interface ProposalSummary {
  id: string;
  title: string;
}

const TEXT_PROPOSAL_TYPE_URL = "/cosmos.gov.v1beta1.TextProposal";

function summarizeProposal(proposal: Proposal): ProposalSummary {
  const content = proposal.content;
  const title =
    content?.typeUrl === TEXT_PROPOSAL_TYPE_URL
      ? TextProposal.decode(content.value).title
      : (content?.typeUrl.split(".").pop() ?? "Proposal");

  return { id: proposal.proposalId.toString(), title };
}

export function useGovernance() {
  const [proposals, setProposals] = useState<ProposalSummary[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProposalsLoading, setIsProposalsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();

  const fetchProposals = useCallback(async () => {
    if (!queryClient) return;

    setIsProposalsLoading(true);
    try {
      const response = await queryClient.gov.proposals(ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD, "", "");
      setProposals(response.proposals.slice(0, 5).map(summarizeProposal));
    } catch (err) {
      console.error("Error fetching proposals:", err);
      setProposals([]);
    } finally {
      setIsProposalsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const vote = useCallback(
    async (proposalId: string, option: VoteOption) => {
      setIsLoading(true);
      setError(null);
      setTxHash(null);

      try {
        if (!address) {
          throw new Error("Please connect your wallet to vote.");
        }

        if (!signingClient) {
          throw new Error("Signing client not initialized. Please try reconnecting.");
        }

        if (!proposalId) {
          throw new Error("Please select a proposal to vote on.");
        }

        const voteMsg: MsgVoteEncodeObject = {
          typeUrl: "/cosmos.gov.v1beta1.MsgVote",
          value: MsgVote.fromPartial({
            proposalId: BigInt(proposalId),
            voter: address,
            option,
          }),
        };

        const result = await signingClient.signAndBroadcast(
          address,
          [voteMsg],
          "auto",
          "Governance vote via Para + CosmJS"
        );

        setTxHash(result.transactionHash);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to submit vote");
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [signingClient, address]
  );

  const reset = useCallback(() => {
    setTxHash(null);
    setError(null);
  }, []);

  return {
    vote,
    proposals,
    txHash,
    isLoading,
    isProposalsLoading,
    isReady: !!signingClient && !!address,
    error,
    reset,
  };
}
