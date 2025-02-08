// Make sure to keep this in sync with capsule-org/src/entities/recoveryAttemptEntity.ts
export enum RecoveryStatus {
  INITIATED = 'INITIATED',
  READY = 'READY',
  EXPIRED = 'EXPIRED',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
}
