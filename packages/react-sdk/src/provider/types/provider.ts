import ParaWeb, {
  AccountCreationEvent,
  AccountSetupEvent,
  ConstructorOpts,
  Environment,
  ExternalWalletChangeEvent,
  LoginEvent,
  LogoutEvent,
  PregenWalletClaimedEvent,
  SignMessageEvent,
  SignTransactionEvent,
  WalletCreatedEvent,
  WalletsChangeEvent,
} from '@getpara/web-sdk';
import { PropsWithChildren } from 'react';

export type Callbacks = {
  onLogout?: (event: LogoutEvent) => void;
  onLogin?: (event: LoginEvent) => void;
  onAccountSetup?: (event: AccountSetupEvent) => void;
  onAccountCreation?: (event: AccountCreationEvent) => void;
  onSignMessage?: (event: SignMessageEvent) => void;
  onSignTransaction?: (event: SignTransactionEvent) => void;
  onExternalWalletChange?: (event: ExternalWalletChangeEvent) => void;
  onWalletsChange?: (event: WalletsChangeEvent) => void;
  onWalletCreated?: (event: WalletCreatedEvent) => void;
  onPregenWalletClaimed?: (event: PregenWalletClaimedEvent) => void;
};

export type ParaProviderConfig = {
  disableAutoSessionKeepAlive?: boolean;
};

interface ParaProviderPropsBase extends PropsWithChildren {
  paraClientConfig?: {
    env: Environment;
    apiKey: string;
    opts?: ConstructorOpts;
  };
  callbacks?: Callbacks;
  config?: ParaProviderConfig;
}

export type ParaProviderProps =
  | ({ config: ParaProviderConfig & { paraClientOverride: ParaWeb }; paraClientConfig?: never } & ParaProviderPropsBase)
  | ({
      config?: ParaProviderConfig & { paraClientOverride?: never };
      paraClientConfig: ParaProviderPropsBase['paraClientConfig'];
    } & ParaProviderPropsBase);
