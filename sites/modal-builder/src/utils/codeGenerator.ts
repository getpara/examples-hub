import { ModalBuilderConfig } from '../types';

export const getModalCodeString = (config: ModalBuilderConfig): string => {
  return `
<ParaModal
  para={para}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  logo={${JSON.stringify(config.appearance.logo)}}
  theme={${JSON.stringify(config.appearance.theme)}}
  oAuthMethods={${JSON.stringify(config.authentication.oAuthMethods)}}
  ${!!config.authentication.disableEmailLogin ? 'disableEmailLogin' : ''}
  ${!!config.authentication.disablePhoneLogin ? 'disablePhoneLogin' : ''}
  authLayout={${JSON.stringify(config.authentication.authLayout)}}
  externalWallets={${JSON.stringify(config.authentication.externalWallets)}}
  ${!!config.security.twoFactorAuthEnabled ? 'twoFactorAuthEnabled' : ''}
  ${!!config.security.recoverySecretStepEnabled ? 'recoverySecretStepEnabled' : ''}
  ${!!config.wallets.hideWallets ? 'hideWallets' : ''}
  onRampTestMode={true}
/>
`
    .replace(/((  )?\n)+/g, `\n`)
    .trim();
};
