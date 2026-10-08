import type { FactRow } from "@/components/ui/Facts";
import { shortenAddress } from "@/lib/format";

export const CANTON_STEP_TITLES = ["Onboard party", "Install preapproval", "Fund party", "Send Amulet"] as const;

export const ONBOARDING_FACTS: FactRow[] = [
  { label: "Prepare", value: "Canton returns the party topology and its hash" },
  { label: "Sign", value: "Para signs the hash" },
  { label: "Allocate", value: "Canton registers the party" },
];

export function getPartyFacts(partyId: string | null, multiHash: string | null): FactRow[] {
  const multiHashRow: FactRow[] = multiHash
    ? [{ label: "multiHash", value: shortenAddress(multiHash), title: multiHash, tone: "mono" }]
    : partyId
      ? []
      : [{ label: "multiHash", value: "Signed when you onboard", tone: "muted" }];

  if (!partyId) {
    return [{ label: "Party", value: "Not allocated", tone: "muted" }, ...multiHashRow];
  }

  return [...multiHashRow, { label: "Party ID", value: partyId, tone: "mono" }];
}

export function getSubmissionFacts(
  preparedHash: string | null,
  updateId: string | null,
  updateIdTestId: string
): FactRow[] {
  return [
    ...(preparedHash
      ? [{ label: "Prepared hash", value: shortenAddress(preparedHash), title: preparedHash, tone: "mono" } satisfies FactRow]
      : []),
    ...(updateId ? [{ label: "Update ID", value: updateId, tone: "mono", testId: updateIdTestId } satisfies FactRow] : []),
  ];
}
