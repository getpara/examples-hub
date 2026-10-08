import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";

export const VOTE_CHOICES = [
  { value: "yes", label: "Yes", option: VoteOption.VOTE_OPTION_YES },
  { value: "no", label: "No", option: VoteOption.VOTE_OPTION_NO },
  { value: "abstain", label: "Abstain", option: VoteOption.VOTE_OPTION_ABSTAIN },
  { value: "veto", label: "No with veto", option: VoteOption.VOTE_OPTION_NO_WITH_VETO },
] as const;

export type VoteChoice = (typeof VOTE_CHOICES)[number]["value"];

export function voteOptionFor(choice: VoteChoice) {
  return VOTE_CHOICES.find((entry) => entry.value === choice)?.option ?? VoteOption.VOTE_OPTION_YES;
}
