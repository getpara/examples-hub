import { ModalBuilderConfig } from '../types';

export const getModalCodeString = (config: ModalBuilderConfig): string => {
  return `
<CapsuleModal
  capsule={capsuleClient}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  logo={${JSON.stringify(config.appearance.logo)}}
  theme={${JSON.stringify(config.appearance.theme)}}
  oAuthMethods={${JSON.stringify(config.authentication.oAuthMethods)}}
  disableEmailLogin={${JSON.stringify(config.authentication.disableEmailLogin)}}
  disablePhoneLogin={${JSON.stringify(config.authentication.disablePhoneLogin)}}
  authLayout={${JSON.stringify(config.authentication.authLayout)}}
  externalWallets={${JSON.stringify(config.authentication.externalWallets)}}
  twoFactorAuthEnabled={${JSON.stringify(config.security.twoFactorAuthEnabled)}}
  recoverySecretStepEnabled={${JSON.stringify(config.security.recoverySecretStepEnabled)}}
  onRampTestMode
  />
`.trim();
};
