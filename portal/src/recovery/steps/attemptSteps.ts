export enum ModalStep {
    EMAIL_COLLECTION = 'EMAIL_COLLECTION',
    VERIFICATION_CODE = 'VERIFICATION_CODE',
    VERIFY_2FA = '2FA',
    RECOVERY_AWAITING = 'RECOVERY_AWAITING',
    RECOVERY_INITIATED = 'RECOVERY_INITIATED',
    LOST_2FA = 'LOST_2FA',
}

export const ModalStepNumber: { [key in ModalStep]: number } = {
    [ModalStep.EMAIL_COLLECTION]: 1,
    [ModalStep.VERIFICATION_CODE]: 2,
    [ModalStep.VERIFY_2FA]: 3,
    [ModalStep.RECOVERY_AWAITING]: 4,
    [ModalStep.RECOVERY_INITIATED]: 4,
    [ModalStep.LOST_2FA]: 4,
};