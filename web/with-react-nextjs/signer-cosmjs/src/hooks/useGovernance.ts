"use client";

import { useState, useEffect, useCallback } from "react";
import { MsgVoteEncodeObject, StargateClient } from "@cosmjs/stargate";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import { useParaSigner } from "./useParaSigner";
import { useCosmosQueryClient } from "./useCosmosQueryClient";

export interface Proposal {
  proposalId: string;
  content: {
    title: string;
    description: string;
  };
  status: string;
  votingEndTime: string;
}

export { VoteOption };

export function useGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [gasUsed, setGasUsed] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProposalsLoading, setIsProposalsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { signingClient, address, isLoading: isSignerLoading } = useParaSigner();
  const { queryClient } = useCosmosQueryClient();

  const fetchProposals = useCallback(async () => {
    if (!queryClient) return;

    setIsProposalsLoading(true);
    try {
      const extendedClient = queryClient as StargateClient & {
        gov: {
          proposals: (
            status: number,
            depositor: string,
            voter: string
          ) => Promise<{ proposals: Proposal[] }>;
        };
      };
      const response = await extendedClient.gov.proposals(
        2, // ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
        "",
        ""
      );
      setProposals(response.proposals.slice(0, 5));
    } catch (err) {
      console.error("Error fetching proposals:", err);
      // For demo purposes, show mock proposals if the query fails
      setProposals([
        {
          proposalId: "1",
          content: {
            title: "Example Proposal: Increase Block Size",
            description:
              "This proposal aims to increase the block size to improve throughput.",
          },
          status: "PROPOSAL_STATUS_VOTING_PERIOD",
          votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } finally {
      setIsProposalsLoading(false);
    }
  }, [queryClient]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const vote = useCallback(
    async (proposalId: string, option: VoteOption) => {
      if (!address) {
        throw new Error("Please connect your wallet to vote.");
      }

      if (!signingClient) {
        throw new Error("Signing client not initialized. Please try reconnecting.");
      }

      if (!proposalId) {
        throw new Error("Please select a proposal to vote on.");
      }

      setIsLoading(true);
      setError(null);
      setTxHash(null);
      setGasUsed(null);

      try {
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
        setGasUsed(result.gasUsed);
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
    setGasUsed(null);
    setError(null);
  }, []);

  return {
    // Actions
    vote,
    fetchProposals,

    // Query data
    proposals,

    // Transaction result
    txHash,
    gasUsed,

    // Loading states
    isLoading: isLoading || isSignerLoading,
    isProposalsLoading,
    isReady: !!signingClient && !!address,

    // Error and reset
    error,
    reset,
  };
}

// Helper function to get vote option text
export function getVoteOptionText(option: VoteOption): string {
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
}
