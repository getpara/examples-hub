import React, { ReactElement, useState } from 'react';
import { AuthLayout, EvmWallet, Network, SolanaWallet } from '@usecapsule/react-sdk';
import { AUTH_METHOD_CONFIGS, EXTERNAL_WALLET_CONFIGS, ALL_AUTH_METHODS, ALL_EXTERNAL_WALLETS } from '../../constants';
import { AuthMethod, ExternalWallet, AuthSectionId, ReorderableType } from '../../types';
import { extractId } from '../../utils/elementIdExtractor';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  DraggableArea,
  DraggableBody,
  DraggableHeader,
  DraggableItem,
  SegmentControl,
} from '../UI';
import { useAtom } from 'jotai';
import { authenticationConfigAtom, networksConfigAtom } from '../../atoms';

export const AuthenticationConfigurator: React.FC = () => {
  const [authenticationConfig, setAuthenticationConfig] = useAtom(authenticationConfigAtom);
  const [networksConfig] = useAtom(networksConfigAtom);

  const [authSectionOrder, setAuthSectionOrder] = useState<AuthSectionId[]>(['web2', 'web3']);
  const [authMethodsOrder, setAuthMethodsOrder] = useState<AuthMethod[]>(ALL_AUTH_METHODS);
  const [externalWalletsOrder, setExternalWalletsOrder] = useState<ExternalWallet[]>(ALL_EXTERNAL_WALLETS);

  const updateAuthLayout = (id: AuthSectionId, value: AuthLayout) => {
    const prefix = id === 'web2' ? 'AUTH:' : 'EXTERNAL:';
    const currentAuthLayout: `${AuthLayout}`[] = authenticationConfig.authLayout ?? [];
    const updatedAuthLayout = currentAuthLayout.map(layout => (layout.startsWith(prefix) ? value : layout));

    setAuthenticationConfig({
      ...authenticationConfig,
      authLayout: updatedAuthLayout,
    });
  };

  const handleReorder = <T extends ReorderableType>(newOrder: ReactElement[]) => {
    const newOrderIds: T[] = newOrder.map(item => extractId<T>(item)).filter((id): id is T => id !== null);
    return newOrderIds;
  };

  const handleAuthSectionsReorder = (newOrder: ReactElement[]) => {
    const newOrderIds = handleReorder<AuthSectionId>(newOrder);

    const newAuthLayout: `${AuthLayout}`[] = [];
    newOrderIds.forEach(id => {
      const layout = id === 'web2' ? authenticationConfig.authLayout?.[0] : authenticationConfig.authLayout?.[1];

      newAuthLayout.push(layout ?? AuthLayout.AUTH_FULL);
    });

    setAuthSectionOrder(newOrderIds);

    setAuthenticationConfig({
      ...authenticationConfig,
      authLayout: newAuthLayout,
    });
  };

  const handleOAuthMethodsReorder = (newOrder: ReactElement[]) => {
    const newOrderIds = handleReorder<AuthMethod>(newOrder);
    const newOAuthMethods = newOrderIds.filter(method => method !== 'email-auth' && method !== 'phone-auth');
    const enabledOAuthMethodsSet = new Set(authenticationConfig.oAuthMethods);
    const filteredOAuthMethods = newOAuthMethods.filter(method => enabledOAuthMethodsSet.has(method));
    setAuthMethodsOrder(newOrderIds);
    setAuthenticationConfig({
      ...authenticationConfig,
      oAuthMethods: filteredOAuthMethods,
    });
  };

  const handleExternalWalletsReorder = (newOrder: ReactElement[]) => {
    const newOrderIds = handleReorder<ExternalWallet>(newOrder);

    const enabledExternalWalletsSet = new Set(authenticationConfig.externalWallets);

    const filteredExternalWallets = newOrderIds.filter(wallet => enabledExternalWalletsSet.has(wallet));

    setExternalWalletsOrder(newOrderIds);

    setAuthenticationConfig({
      ...authenticationConfig,
      externalWallets: filteredExternalWallets,
    });
  };

  const toggleAuthSection = (sectionId: AuthSectionId) => {
    const newAuthConfig = { ...authenticationConfig };

    if (
      (sectionId === 'web2' && !newAuthConfig.isWeb3AuthEnabled && newAuthConfig.isWeb2AuthEnabled) ||
      (sectionId === 'web3' && !newAuthConfig.isWeb2AuthEnabled && newAuthConfig.isWeb3AuthEnabled)
    ) {
      return;
    }

    if (sectionId === 'web2') {
      newAuthConfig.isWeb2AuthEnabled = !newAuthConfig.isWeb2AuthEnabled;
      if (!newAuthConfig.isWeb2AuthEnabled) {
        newAuthConfig.disableEmailLogin = true;
        newAuthConfig.disablePhoneLogin = true;
        newAuthConfig.oAuthMethods = [];
        newAuthConfig.authLayout = newAuthConfig.authLayout?.filter(layout => !layout.startsWith('AUTH:'));
      }
    } else {
      newAuthConfig.isWeb3AuthEnabled = !newAuthConfig.isWeb3AuthEnabled;
      if (!newAuthConfig.isWeb3AuthEnabled) {
        newAuthConfig.externalWallets = [];
        newAuthConfig.authLayout = newAuthConfig.authLayout?.filter(layout => !layout.startsWith('EXTERNAL:'));
      }
    }

    setAuthenticationConfig(newAuthConfig);
  };

  const toggleAuthMethod = (method: AuthMethod) => {
    const newAuthConfig = { ...authenticationConfig };
    switch (method) {
      case 'email-auth':
        newAuthConfig.disableEmailLogin = !newAuthConfig.disableEmailLogin;
        break;
      case 'phone-auth':
        newAuthConfig.disablePhoneLogin = !newAuthConfig.disablePhoneLogin;
        break;
      default:
        const oAuthMethods = new Set(newAuthConfig.oAuthMethods);
        oAuthMethods.has(method) ? oAuthMethods.delete(method) : oAuthMethods.add(method);
        newAuthConfig.oAuthMethods = Array.from(oAuthMethods).sort((a, b) => {
          return authMethodsOrder.indexOf(a) - authMethodsOrder.indexOf(b);
        });
    }

    if (newAuthConfig.oAuthMethods?.length === 0 && newAuthConfig.disableEmailLogin && newAuthConfig.disablePhoneLogin) {
      newAuthConfig.authLayout = newAuthConfig.authLayout?.filter(layout => !layout.startsWith('AUTH:'));
    } else {
      if (!newAuthConfig.authLayout?.some(layout => layout.startsWith('AUTH:'))) {
        newAuthConfig.authLayout = [AuthLayout.AUTH_FULL, ...(newAuthConfig.authLayout ?? [])];
      }
    }

    setAuthenticationConfig(newAuthConfig);
  };

  const toggleExternalWallet = (wallet: ExternalWallet) => {
    const newAuthConfig = { ...authenticationConfig };
    const externalWallets = new Set(newAuthConfig.externalWallets);
    externalWallets.has(wallet) ? externalWallets.delete(wallet) : externalWallets.add(wallet);
    newAuthConfig.externalWallets = Array.from(externalWallets).sort((a, b) => {
      return externalWalletsOrder.indexOf(a) - externalWalletsOrder.indexOf(b);
    });
    setAuthenticationConfig(newAuthConfig);
  };

  const filteredExternalWallets = (wallets: ExternalWallet[]) => {
    return wallets.filter(wallet => {
      if (Object.values(EvmWallet).includes(wallet as EvmWallet)) {
        return networksConfig.networks!.includes(Network.ETHEREUM);
      }

      if (Object.values(SolanaWallet).includes(wallet as SolanaWallet)) {
        return networksConfig.networks!.includes(Network.SOLANA);
      }
      return false;
    });
  };

  const renderWeb2Section = () => (
    <DraggableItem key="web2" id="web2" backgroundColor="#f0f0f0">
      <DraggableHeader
        id="web2"
        label="Web 2.0"
        isEnabled={authenticationConfig.isWeb2AuthEnabled}
        onToggle={() => toggleAuthSection('web2')}
        accordion={false}
        isExpanded={true}
      />
      <DraggableBody isExpanded>
        <SegmentControl
          items={[
            { icon: 'spacingHeight', label: 'Expanded', value: AuthLayout.AUTH_FULL },
            { icon: 'alignVerticalCenter', label: 'Collapsed', value: AuthLayout.AUTH_CONDENSED },
          ]}
          onSelect={value => updateAuthLayout('web2', value as AuthLayout)}
          defaultSelectedIndex={authenticationConfig.authLayout?.includes(AuthLayout.AUTH_FULL) ? 0 : 1}
        />
        <DraggableArea onOrderChange={handleOAuthMethodsReorder}>
          {authMethodsOrder.map(id => (
            <DraggableItem key={id} id={id} backgroundColor="#ffffff" padding="0.5rem 0.75rem">
              <DraggableHeader
                id={id}
                logo={AUTH_METHOD_CONFIGS[id].logo}
                label={AUTH_METHOD_CONFIGS[id].label}
                isEnabled={
                  id === 'email-auth'
                    ? !authenticationConfig.disableEmailLogin
                    : id === 'phone-auth'
                      ? !authenticationConfig.disablePhoneLogin
                      : authenticationConfig.oAuthMethods!.includes(id)
                }
                onToggle={() => toggleAuthMethod(id)}
                accordion={false}
                isExpanded={false}
                disabled={!authenticationConfig.isWeb2AuthEnabled}
              />
            </DraggableItem>
          ))}
        </DraggableArea>
      </DraggableBody>
    </DraggableItem>
  );

  const renderWeb3Section = () => (
    <DraggableItem key="web3" id="web3" backgroundColor="#f0f0f0">
      <DraggableHeader
        id="web3"
        label="Web 3.0"
        isEnabled={authenticationConfig.isWeb3AuthEnabled}
        onToggle={() => toggleAuthSection('web3')}
        accordion={false}
        isExpanded={true}
      />
      <DraggableBody isExpanded={true}>
        <SegmentControl
          items={[
            { icon: 'spacingHeight', label: 'Expanded', value: AuthLayout.EXTERNAL_FULL },
            { icon: 'alignVerticalCenter', label: 'Collapsed', value: AuthLayout.EXTERNAL_CONDENSED },
          ]}
          onSelect={value => updateAuthLayout('web3', value as AuthLayout)}
          defaultSelectedIndex={0}
        />
        <DraggableArea onOrderChange={handleExternalWalletsReorder}>
          {filteredExternalWallets(externalWalletsOrder).map(wallet => (
            <DraggableItem key={wallet} id={wallet} backgroundColor="#ffffff" padding="0.5rem 0.75rem">
              <DraggableHeader
                id={wallet}
                logo={EXTERNAL_WALLET_CONFIGS[wallet].logo}
                label={EXTERNAL_WALLET_CONFIGS[wallet].label}
                isEnabled={authenticationConfig.externalWallets!.includes(wallet)}
                onToggle={() => toggleExternalWallet(wallet)}
                accordion={false}
                isExpanded={false}
                disabled={!authenticationConfig.isWeb3AuthEnabled}
              />
            </DraggableItem>
          ))}
        </DraggableArea>
      </DraggableBody>
    </DraggableItem>
  );

  return (
    <AccordionItem value="authentication">
      <AccordionTrigger label="Authentication" secondaryText="Configure login, sign up, and wallet connection options." />
      <AccordionContent>
        <DraggableArea onOrderChange={handleAuthSectionsReorder}>
          {authSectionOrder.map(sectionId => (sectionId === 'web2' ? renderWeb2Section() : renderWeb3Section()))}
        </DraggableArea>
      </AccordionContent>
    </AccordionItem>
  );
};
