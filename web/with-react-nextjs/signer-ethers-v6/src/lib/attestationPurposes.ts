export const ATTESTATION_PURPOSES = [
  "Governance Participation",
  "Token Holder Verification",
  "Community Membership",
  "Trading Authorization",
] as const;

export type AttestationPurpose = (typeof ATTESTATION_PURPOSES)[number];

export const ATTESTATION_PURPOSE_OPTIONS = ATTESTATION_PURPOSES.map((purpose) => ({ value: purpose, label: purpose }));

export function isAttestationPurpose(value: string): value is AttestationPurpose {
  return ATTESTATION_PURPOSES.some((purpose) => purpose === value);
}
