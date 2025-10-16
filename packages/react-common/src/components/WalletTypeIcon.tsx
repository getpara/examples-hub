import { CpslIcon } from '@getpara/react-components';
import { ACCOUNT_TYPES } from '../constants/oAuthLogos.js';
import { WALLET_TYPES_METADATA } from '../constants/index.js';
import { TExternalWallet, TWalletType } from '@getpara/web-sdk';
import { CommonWallet } from '../types/index.js';

export function WalletTypeIcon({
  className,
  walletType,
  externalWallet,
  isDark = false,
  ...props
}: {
  className?: string;
  walletType: TWalletType;
  isDark?: boolean;
  externalWallet?: TExternalWallet | CommonWallet | string;
} & Parameters<typeof CpslIcon>[0]) {
  // If iconUrl is provided, use it directly
  if (typeof externalWallet === 'object' && 'iconUrl' in externalWallet) {
    return <CpslIcon className={className} src={externalWallet.iconUrl} {...props} inset={props.inset ?? '10%'} />;
  }

  // Otherwise, use the existing logic
  const data = (externalWallet ? ACCOUNT_TYPES[externalWallet] : WALLET_TYPES_METADATA[walletType]) || {
    icon: 'wallet02',
    isDark: true,
  };

  props.size;

  return (
    <CpslIcon
      className={className}
      icon={data.icon}
      invert={isDark && data.isDark}
      {...props}
      inset={props.inset ?? '10%'}
    />
  );
}
