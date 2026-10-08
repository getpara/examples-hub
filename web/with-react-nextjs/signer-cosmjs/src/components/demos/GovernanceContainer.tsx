"use client";

import { useState, type FormEvent } from "react";
import { RouteWorkbench } from "@/components/layout/RouteWorkbench";
import { ActionPanel } from "@/components/ui/ActionPanel";
import { Button } from "@/components/ui/Button";
import { DemoNav } from "@/components/ui/DemoNav";
import { ResultPanel } from "@/components/ui/ResultPanel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectField } from "@/components/ui/SelectField";
import { useGovernance } from "@/hooks/useGovernance";
import { explorerTxUrl } from "@/lib/chain";
import { DEMOS } from "@/lib/demos";
import { BROADCAST_PENDING_MESSAGE } from "@/lib/display";
import { formatErrorMessage } from "@/lib/format";
import { getResultStatus } from "@/lib/resultStatus";
import { useCopyToClipboard } from "@/lib/useCopyToClipboard";
import { VOTE_CHOICES, voteOptionFor, type VoteChoice } from "@/lib/votes";

export function GovernanceContainer() {
  const [proposalId, setProposalId] = useState("");
  const [choice, setChoice] = useState<VoteChoice>("yes");
  const governance = useGovernance();
  const hashCopy = useCopyToClipboard();

  const vote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    governance.reset();
    await governance.vote(proposalId, voteOptionFor(choice)).catch(() => undefined);
  };

  const emptyProposalLabel = governance.isProposalsLoading
    ? "Loading proposals"
    : governance.proposals.length > 0
      ? "Choose a proposal"
      : "No proposals in the voting period";

  const proposalOptions = [
    { value: "", label: emptyProposalLabel },
    ...governance.proposals.map((proposal) => ({ value: proposal.id, label: `#${proposal.id} ${proposal.title}` })),
  ];

  return (
    <RouteWorkbench
      nav={<DemoNav items={DEMOS} currentHref="/governance" />}
      aside={
        <ResultPanel
          status={getResultStatus({
            isPending: governance.isLoading,
            errorMessage: governance.error?.message,
            value: governance.txHash,
          })}
          emptyMessage="The transaction hash appears here after you vote."
          pendingMessage={BROADCAST_PENDING_MESSAGE}
          successLabel="Confirmed"
          fields={governance.txHash ? [{ label: "Transaction hash", value: governance.txHash }] : []}
          onCopy={() => governance.txHash && hashCopy.copy(governance.txHash)}
          copiedMessage="Transaction hash copied"
          copyStatus={hashCopy.status}
          explorerHref={governance.txHash ? explorerTxUrl(governance.txHash) : undefined}
          errorTitle="Vote failed"
          errorMessage={formatErrorMessage(governance.error?.message ?? null)}
        />
      }>
      <form onSubmit={vote}>
        <ActionPanel
          title="Governance"
          api="signAndBroadcast([MsgVote])"
          description="Vote on a proposal in its voting period. Your voting power comes from your staked ATOM."
          actions={
            <Button
              type="submit"
              size="lg"
              isLoading={governance.isLoading}
              disabled={!proposalId || !governance.isReady}>
              Submit vote
            </Button>
          }>
          <SelectField
            label="Proposal"
            options={proposalOptions}
            value={proposalId}
            onChange={(event) => setProposalId(event.target.value)}
            disabled={governance.isProposalsLoading || governance.isLoading}
          />
          <SegmentedControl
            label="Vote"
            options={VOTE_CHOICES}
            value={choice}
            onChange={setChoice}
            disabled={governance.isLoading}
          />
        </ActionPanel>
      </form>
    </RouteWorkbench>
  );
}
