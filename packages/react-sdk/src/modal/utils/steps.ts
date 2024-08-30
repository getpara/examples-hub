export enum ModalStep {
  SIGN_UP = 'SIGN_UP',
  SIGN_UP_ALL_OAUTH = 'SIGN_UP_ALL_OAUTH',
  AWAITING_OAUTH = 'AWAITING_OAUTH',
  FARCASTER_OAUTH = 'FARCASTER_OAUTH',
  VERIFICATION_CODE = 'VERIFICATION_CODE',
  VERIFICATION_CODE_FOR_PHONE = 'VERIFICATION_CODE_FOR_PHONE',
  BIOMETRIC_CREATION = 'BIOMETRIC_CREATION',
  AWAITING_BIOMETRIC_CREATION = 'AWAITING_BIOMETRIC_CREATION',
  AWAITING_WALLET_CREATION = 'AWAITING_WALLET_CREATION',
  WALLET_CREATION_DONE = 'WALLET_CREATION_DONE',
  SECRET = 'SECRET',
  BIOMETRIC_LOGIN = 'BIOMETRIC_LOGIN',
  AWAITING_BIOMETRIC_LOGIN = 'AWAITING_BIOMETRIC_LOGIN',
  LOGIN_DONE = 'LOGIN_DONE',
  SETUP_2FA = 'SETUP_2FA',
  VERIFY_2FA = 'VERIFY_2FA',
  TWO_FACTOR_DONE = 'TWO_FACTOR_DONE',
  ADD_FUNDS = 'ADD_FUNDS',
  ADD_FUNDS_AWAITING = 'ADD_FUNDS_AWAITING',
  ADD_FUNDS_SUCCESS = 'ADD_FUNDS_SUCCESS',
  ADD_FUNDS_FAILURE = 'ADD_FUNDS_FAILURE',
}

export type ModalStepPropU = keyof typeof ModalStep | ModalStep;

export type ModalStepPropL = Lowercase<ModalStepPropU>;

export type ModalStepProp = ModalStepPropU | ModalStepPropL;

enum SignUpModalStep {
  SIGN_UP = 'SIGN_UP',
  SIGN_UP_ALL_OAUTH = 'SIGN_UP_ALL_OAUTH',
  AWAITING_OAUTH = 'AWAITING_OAUTH',
  FARCASTER_OAUTH = 'FARCASTER_OAUTH',
  VERIFICATION_CODE = 'VERIFICATION_CODE',
  VERIFICATION_CODE_FOR_PHONE = 'VERIFICATION_CODE_FOR_PHONE',
  BIOMETRIC_CREATION = 'BIOMETRIC_CREATION',
  AWAITING_BIOMETRIC_CREATION = 'AWAITING_BIOMETRIC_CREATION',
  AWAITING_WALLET_CREATION = 'AWAITING_WALLET_CREATION',
  WALLET_CREATION_DONE = 'WALLET_CREATION_DONE',
  SECRET = 'SECRET',
  SETUP_2FA = 'SETUP_2FA',
  VERIFY_2FA = 'VERIFY_2FA',
  TWO_FACTOR_DONE = 'TWO_FACTOR_DONE',
  ADD_FUNDS = 'ADD_FUNDS',
  ADD_FUNDS_AWAITING = 'ADD_FUNDS_AWAITING',
  ADD_FUNDS_SUCCESS = 'ADD_FUNDS_SUCCESS',
  ADD_FUNDS_FAILURE = 'ADD_FUNDS_FAILURE',
}

export const SignUpModalStepNumber: { [key in SignUpModalStep]: number } = {
  [SignUpModalStep.SIGN_UP]: 1,
  [SignUpModalStep.SIGN_UP_ALL_OAUTH]: 1,
  [SignUpModalStep.AWAITING_OAUTH]: 1,
  [SignUpModalStep.FARCASTER_OAUTH]: 1,
  [SignUpModalStep.VERIFICATION_CODE]: 2,
  [SignUpModalStep.VERIFICATION_CODE_FOR_PHONE]: 2,
  [SignUpModalStep.BIOMETRIC_CREATION]: 3,
  [SignUpModalStep.AWAITING_BIOMETRIC_CREATION]: 3,
  [SignUpModalStep.AWAITING_WALLET_CREATION]: 4,
  [SignUpModalStep.WALLET_CREATION_DONE]: 5,
  [SignUpModalStep.SECRET]: 5,
  [SignUpModalStep.SETUP_2FA]: 5,
  [SignUpModalStep.VERIFY_2FA]: 5,
  [SignUpModalStep.TWO_FACTOR_DONE]: 5,
  [SignUpModalStep.ADD_FUNDS]: 6,
  [SignUpModalStep.ADD_FUNDS_AWAITING]: 6,
  [SignUpModalStep.ADD_FUNDS_SUCCESS]: 6,
  [SignUpModalStep.ADD_FUNDS_FAILURE]: 6,
};

export const SignUpPreviousStep: {
  [key in SignUpModalStep]: ModalStep | undefined;
} = {
  [SignUpModalStep.SIGN_UP]: undefined,
  [SignUpModalStep.SIGN_UP_ALL_OAUTH]: ModalStep.SIGN_UP,
  [SignUpModalStep.AWAITING_OAUTH]: ModalStep.SIGN_UP,
  [SignUpModalStep.FARCASTER_OAUTH]: ModalStep.SIGN_UP,
  [SignUpModalStep.VERIFICATION_CODE]: ModalStep.SIGN_UP,
  [SignUpModalStep.VERIFICATION_CODE_FOR_PHONE]: ModalStep.SIGN_UP,
  [SignUpModalStep.BIOMETRIC_CREATION]: ModalStep.SIGN_UP,
  [SignUpModalStep.AWAITING_BIOMETRIC_CREATION]: ModalStep.BIOMETRIC_CREATION,
  [SignUpModalStep.AWAITING_WALLET_CREATION]: undefined,
  [SignUpModalStep.WALLET_CREATION_DONE]: undefined,
  [SignUpModalStep.SECRET]: undefined,
  [SignUpModalStep.SETUP_2FA]: ModalStep.SECRET,
  [SignUpModalStep.VERIFY_2FA]: ModalStep.SETUP_2FA,
  [SignUpModalStep.TWO_FACTOR_DONE]: undefined,
  [SignUpModalStep.ADD_FUNDS]: undefined,
  [SignUpModalStep.ADD_FUNDS_AWAITING]: ModalStep.ADD_FUNDS,
  [SignUpModalStep.ADD_FUNDS_SUCCESS]: undefined,
  [SignUpModalStep.ADD_FUNDS_FAILURE]: undefined,
};

enum LoginModalStep {
  SIGN_UP = 'SIGN_UP',
  SIGN_UP_ALL_OAUTH = 'SIGN_UP_ALL_OAUTH',
  AWAITING_OAUTH = 'AWAITING_OAUTH',
  FARCASTER_OAUTH = 'FARCASTER_OAUTH',
  BIOMETRIC_LOGIN = 'BIOMETRIC_LOGIN',
  AWAITING_BIOMETRIC_LOGIN = 'AWAITING_BIOMETRIC_LOGIN',
  AWAITING_WALLET_CREATION = 'AWAITING_WALLET_CREATION',
  WALLET_CREATION_DONE = 'WALLET_CREATION_DONE',
  SECRET = 'SECRET',
  SETUP_2FA = 'SETUP_2FA',
  VERIFY_2FA = 'VERIFY_2FA',
  TWO_FACTOR_DONE = 'TWO_FACTOR_DONE',
  LOGIN_DONE = 'LOGIN_DONE',
  ADD_FUNDS = 'ADD_FUNDS',
  ADD_FUNDS_AWAITING = 'ADD_FUNDS_AWAITING',
  ADD_FUNDS_SUCCESS = 'ADD_FUNDS_SUCCESS',
  ADD_FUNDS_FAILURE = 'ADD_FUNDS_FAILURE',
}

export const LoginModalStepNumber: { [key in LoginModalStep]: number } = {
  [LoginModalStep.SIGN_UP]: 1,
  [LoginModalStep.SIGN_UP_ALL_OAUTH]: 1,
  [LoginModalStep.AWAITING_OAUTH]: 1,
  [LoginModalStep.FARCASTER_OAUTH]: 1,
  [LoginModalStep.BIOMETRIC_LOGIN]: 2,
  [LoginModalStep.AWAITING_BIOMETRIC_LOGIN]: 2,
  [LoginModalStep.AWAITING_WALLET_CREATION]: 3,
  [LoginModalStep.WALLET_CREATION_DONE]: 4,
  [LoginModalStep.SECRET]: 4,
  [LoginModalStep.SETUP_2FA]: 4,
  [LoginModalStep.VERIFY_2FA]: 4,
  [LoginModalStep.TWO_FACTOR_DONE]: 4,
  [LoginModalStep.LOGIN_DONE]: 4,
  [LoginModalStep.ADD_FUNDS]: 5,
  [LoginModalStep.ADD_FUNDS_AWAITING]: 5,
  [LoginModalStep.ADD_FUNDS_SUCCESS]: 5,
  [LoginModalStep.ADD_FUNDS_FAILURE]: 5,
};

export const LoginPreviousStep: {
  [key in LoginModalStep]: ModalStep | undefined;
} = {
  [LoginModalStep.SIGN_UP]: undefined,
  [LoginModalStep.SIGN_UP_ALL_OAUTH]: ModalStep.SIGN_UP,
  [LoginModalStep.AWAITING_OAUTH]: ModalStep.SIGN_UP,
  [LoginModalStep.FARCASTER_OAUTH]: ModalStep.SIGN_UP,
  [LoginModalStep.BIOMETRIC_LOGIN]: ModalStep.SIGN_UP,
  [LoginModalStep.AWAITING_BIOMETRIC_LOGIN]: ModalStep.BIOMETRIC_LOGIN,
  [LoginModalStep.AWAITING_WALLET_CREATION]: undefined,
  [LoginModalStep.WALLET_CREATION_DONE]: undefined,
  [LoginModalStep.SECRET]: undefined,
  [LoginModalStep.SETUP_2FA]: undefined,
  [LoginModalStep.VERIFY_2FA]: ModalStep.SETUP_2FA,
  [LoginModalStep.TWO_FACTOR_DONE]: undefined,
  [LoginModalStep.LOGIN_DONE]: undefined,
  [LoginModalStep.ADD_FUNDS]: ModalStep.LOGIN_DONE,
  [LoginModalStep.ADD_FUNDS_AWAITING]: ModalStep.ADD_FUNDS,
  [LoginModalStep.ADD_FUNDS_SUCCESS]: undefined,
  [LoginModalStep.ADD_FUNDS_FAILURE]: undefined,
};

export const NoIndicatorSteps = [
  ModalStep.SIGN_UP,
  ModalStep.SIGN_UP_ALL_OAUTH,
  ModalStep.AWAITING_OAUTH,
  ModalStep.SETUP_2FA,
  ModalStep.LOGIN_DONE,
  ModalStep.TWO_FACTOR_DONE,
  ModalStep.ADD_FUNDS,
  ModalStep.ADD_FUNDS_AWAITING,
  ModalStep.ADD_FUNDS_SUCCESS,
  ModalStep.ADD_FUNDS_FAILURE,
];
