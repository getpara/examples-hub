export enum ModalStep {
  VERIFY_2FA = 'VERIFY_2FA',
  LOST_2FA = 'LOST_2FA',
  SECRET = 'SECRET',
  BIOMETRIC = 'BIOMETRIC',
  AWAITING_FINISH = 'AWAITING_FINISH',
  FINISH = 'FINISH',
}

export const ModalStepNumber: { [key in ModalStep]: number } = {
  [ModalStep.VERIFY_2FA]: 1,
  [ModalStep.SECRET]: 2,
  [ModalStep.BIOMETRIC]: 3,
  [ModalStep.AWAITING_FINISH]: 3,
  [ModalStep.LOST_2FA]: 4,
  [ModalStep.FINISH]: 4,
};
