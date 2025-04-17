import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  TOAuthMethod,
  ExternalWallet as SDKExternalWallet,
  EvmWallet,
  SolanaWallet,
  CosmosWallet,
  Network,
  OAUTH_METHODS,
} from '@getpara/react-sdk';
import { AUTH_METHOD_CONFIGS, EXTERNAL_WALLET_CONFIGS, ALL_AUTH_METHODS, ALL_EXTERNAL_WALLETS } from '../../constants';
import { AuthMethod, ExternalWallet, AuthSectionId, TAuthLayout } from '../../types';
import { AccordionContent, AccordionItem, AccordionTrigger, DraggableArea, DraggableItem, SegmentControl } from '../UI';
import { authenticationConfigAtom, networksConfigAtom, previousWeb2StateAtom, previousWeb3StateAtom } from '../../atoms';

export const AuthenticationConfigurator: React.FC = () => {
  const [authenticationConfig, setAuthenticationConfig] = useAtom(authenticationConfigAtom);
  const [networksConfig, setNetworksConfig] = useAtom(networksConfigAtom);
  const [prevWeb2State, setPrevWeb2State] = useAtom(previousWeb2StateAtom);
  const [prevWeb3State, setPrevWeb3State] = useAtom(previousWeb3StateAtom);

  const [authSectionOrder, setAuthSectionOrder] = useState<AuthSectionId[]>(['web2', 'web3']);
  const [authMethodsOrder, setAuthMethodsOrder] = useState<AuthMethod[]>(ALL_AUTH_METHODS);
  const [externalWalletsOrder, setExternalWalletsOrder] = useState<ExternalWallet[]>(ALL_EXTERNAL_WALLETS);

  useEffect(() => {
    if (!prevWeb2State) {
      setPrevWeb2State({
        oAuthMethods: authenticationConfig.oAuthMethods ?? [],
        disableEmailLogin: authenticationConfig.disableEmailLogin ?? false,
        disablePhoneLogin: authenticationConfig.disablePhoneLogin ?? false,
        authLayoutWeb2:
          authenticationConfig.authLayout?.find(l => l === 'AUTH:FULL' || l === 'AUTH:CONDENSED') ??
          ('AUTH:FULL' as TAuthLayout),
      });
    }
    if (!prevWeb3State) {
      setPrevWeb3State({
        externalWallets: authenticationConfig.externalWallets ?? [],
        authLayoutWeb3:
          authenticationConfig.authLayout?.find(l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED') ??
          ('EXTERNAL:FULL' as TAuthLayout),
      });
    }
  }, [authenticationConfig, prevWeb2State, prevWeb3State, setPrevWeb2State, setPrevWeb3State]);

  const updateAuthLayout = (id: AuthSectionId, value: TAuthLayout) => {
    const currentAuthLayout = authenticationConfig.authLayout ?? [];
    const isWeb2 = id === 'web2';
    const updatedAuthLayout = currentAuthLayout.map(layout => {
      const isAuthSectionLayout = layout === 'AUTH:FULL' || layout === 'AUTH:CONDENSED';
      const isExternalSectionLayout = layout === 'EXTERNAL:FULL' || layout === 'EXTERNAL:CONDENSED';
      if (isWeb2 && isAuthSectionLayout) {
        return value;
      } else if (!isWeb2 && isExternalSectionLayout) {
        return value;
      }
      return layout;
    });
    ensureAuthLayoutConsistency(id, updatedAuthLayout);
    setAuthenticationConfig({
      ...authenticationConfig,
      authLayout: updatedAuthLayout,
    });
    if (isWeb2 && prevWeb2State) {
      setPrevWeb2State({
        ...prevWeb2State,
        authLayoutWeb2: value,
      });
    } else if (!isWeb2 && prevWeb3State) {
      setPrevWeb3State({
        ...prevWeb3State,
        authLayoutWeb3: value,
      });
    }
  };

  const ensureAuthLayoutConsistency = (sectionId: AuthSectionId, newLayout: TAuthLayout[]) => {
    if (sectionId === 'web2' && authenticationConfig.isWeb2AuthEnabled) {
      const hasAuth = newLayout.some(l => l === 'AUTH:FULL' || l === 'AUTH:CONDENSED');
      if (!hasAuth) {
        const layoutToAdd = prevWeb2State?.authLayoutWeb2 ?? ('AUTH:FULL' as TAuthLayout);
        newLayout.push(layoutToAdd);
      }
    } else if (sectionId === 'web3' && authenticationConfig.isWeb3AuthEnabled) {
      const hasExternal = newLayout.some(l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED');
      if (!hasExternal) {
        const layoutToAdd = prevWeb3State?.authLayoutWeb3 ?? ('EXTERNAL:FULL' as TAuthLayout);
        newLayout.push(layoutToAdd);
      }
    }
  };

  const toggleAuthSection = (sectionId: AuthSectionId) => {
    const newAuthConfig = { ...authenticationConfig };
    const isWeb2 = sectionId === 'web2';
    if (isWeb2) {
      if (newAuthConfig.isWeb2AuthEnabled) {
        setPrevWeb2State({
          oAuthMethods: newAuthConfig.oAuthMethods ?? [],
          disableEmailLogin: newAuthConfig.disableEmailLogin ?? false,
          disablePhoneLogin: newAuthConfig.disablePhoneLogin ?? false,
          authLayoutWeb2:
            newAuthConfig.authLayout?.find(l => l === 'AUTH:FULL' || l === 'AUTH:CONDENSED') ?? ('AUTH:FULL' as TAuthLayout),
        });
        newAuthConfig.isWeb2AuthEnabled = false;
        newAuthConfig.disableEmailLogin = true;
        newAuthConfig.disablePhoneLogin = true;
        newAuthConfig.oAuthMethods = [];
        newAuthConfig.authLayout = (newAuthConfig.authLayout ?? []).filter(
          layout => layout !== 'AUTH:FULL' && layout !== 'AUTH:CONDENSED',
        );
      } else {
        newAuthConfig.isWeb2AuthEnabled = true;
        if (prevWeb2State) {
          newAuthConfig.oAuthMethods = prevWeb2State.oAuthMethods ?? [];
          newAuthConfig.disableEmailLogin = prevWeb2State.disableEmailLogin ?? false;
          newAuthConfig.disablePhoneLogin = prevWeb2State.disablePhoneLogin ?? false;
          const hasAuth = (newAuthConfig.authLayout ?? []).some(l => l === 'AUTH:FULL' || l === 'AUTH:CONDENSED');
          if (!hasAuth) {
            const layoutToAdd = prevWeb2State.authLayoutWeb2 ?? ('AUTH:FULL' as TAuthLayout);
            newAuthConfig.authLayout = [...(newAuthConfig.authLayout ?? []), layoutToAdd];
          }
        } else {
          newAuthConfig.disableEmailLogin = false;
          newAuthConfig.disablePhoneLogin = false;
          newAuthConfig.oAuthMethods = ['GOOGLE'];
          if (!(newAuthConfig.authLayout ?? []).some(l => l === 'AUTH:FULL' || l === 'AUTH:CONDENSED')) {
            newAuthConfig.authLayout = ['AUTH:FULL' as TAuthLayout, ...(newAuthConfig.authLayout ?? [])];
          }
        }
      }
    } else {
      if (newAuthConfig.isWeb3AuthEnabled) {
        setPrevWeb3State({
          externalWallets: newAuthConfig.externalWallets ?? [],
          authLayoutWeb3:
            newAuthConfig.authLayout?.find(l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED') ??
            ('EXTERNAL:FULL' as TAuthLayout),
        });
        newAuthConfig.isWeb3AuthEnabled = false;
        newAuthConfig.externalWallets = [];
        newAuthConfig.authLayout = (newAuthConfig.authLayout ?? []).filter(
          layout => layout !== 'EXTERNAL:FULL' && layout !== 'EXTERNAL:CONDENSED',
        );
      } else {
        newAuthConfig.isWeb3AuthEnabled = true;
        if (prevWeb3State) {
          newAuthConfig.externalWallets = prevWeb3State.externalWallets ?? [];
          const hasExternal = (newAuthConfig.authLayout ?? []).some(
            l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED',
          );
          if (!hasExternal) {
            const layoutToAdd = prevWeb3State.authLayoutWeb3 ?? ('EXTERNAL:FULL' as TAuthLayout);
            newAuthConfig.authLayout = [...(newAuthConfig.authLayout ?? []), layoutToAdd];
          }
        } else {
          newAuthConfig.externalWallets = [SDKExternalWallet.METAMASK];
          if (!(newAuthConfig.authLayout ?? []).some(l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED')) {
            newAuthConfig.authLayout = [...(newAuthConfig.authLayout ?? []), 'EXTERNAL:FULL' as TAuthLayout];
          }
        }
        if (networksConfig.networks!.length === 0) {
          setNetworksConfig({
            ...networksConfig,
            networks: [Network.ETHEREUM, Network.SOLANA, Network.COSMOS],
          });
        }
      }
    }
    setAuthenticationConfig(newAuthConfig);
  };

  const toggleAuthMethod = (method: AuthMethod) => {
    const newAuthConfig = { ...authenticationConfig };
    const currentlyEnabledWeb2Methods = [
      newAuthConfig.disableEmailLogin ? null : 'email-auth',
      newAuthConfig.disablePhoneLogin ? null : 'phone-auth',
      ...(newAuthConfig.oAuthMethods ?? []),
    ].filter(Boolean) as (string | TOAuthMethod)[];
    const isWeb2Method =
      method === 'email-auth' || method === 'phone-auth' || OAUTH_METHODS.includes(method as TOAuthMethod);
    const removingLastWeb2 =
      isWeb2Method && currentlyEnabledWeb2Methods.length === 1 && currentlyEnabledWeb2Methods.includes(method);
    if (removingLastWeb2) {
      const web3Enabled = newAuthConfig.isWeb3AuthEnabled ?? false;
      const web3Count = (newAuthConfig.externalWallets ?? []).length;
      if (!web3Enabled || web3Count === 0) {
        return;
      }
    }
    if (method === 'email-auth') {
      newAuthConfig.disableEmailLogin = !newAuthConfig.disableEmailLogin;
    } else if (method === 'phone-auth') {
      newAuthConfig.disablePhoneLogin = !newAuthConfig.disablePhoneLogin;
    } else {
      const oAuthSet = new Set(newAuthConfig.oAuthMethods ?? []);
      if (oAuthSet.has(method as TOAuthMethod)) {
        oAuthSet.delete(method as TOAuthMethod);
      } else {
        oAuthSet.add(method as TOAuthMethod);
      }
      newAuthConfig.oAuthMethods = Array.from(oAuthSet).sort(
        (a, b) => authMethodsOrder.indexOf(a) - authMethodsOrder.indexOf(b),
      );
    }
    setAuthenticationConfig(newAuthConfig);
  };

  const toggleExternalWallet = (wallet: ExternalWallet) => {
    const newAuthConfig = { ...authenticationConfig };
    const externalWallets = new Set(newAuthConfig.externalWallets ?? []);
    const currentlyEnabledWeb3 = newAuthConfig.externalWallets ?? [];
    const removingLastWeb3 = externalWallets.has(wallet) && currentlyEnabledWeb3.length === 1;
    if (removingLastWeb3) {
      const web2Enabled = newAuthConfig.isWeb2AuthEnabled ?? false;
      const web2Methods = [
        newAuthConfig.disableEmailLogin ? null : 'email-auth',
        newAuthConfig.disablePhoneLogin ? null : 'phone-auth',
        ...(newAuthConfig.oAuthMethods ?? []),
      ].filter(Boolean);
      if (!web2Enabled || web2Methods.length === 0) {
        return;
      }
    }
    if (externalWallets.has(wallet)) {
      externalWallets.delete(wallet);
    } else {
      externalWallets.add(wallet);
    }
    newAuthConfig.externalWallets = Array.from(externalWallets);
    setAuthenticationConfig(newAuthConfig);
  };

  const filteredExternalWallets = (wallets: ExternalWallet[]) => {
    const evmValues = Object.values(EvmWallet) as string[];
    const solValues = Object.values(SolanaWallet) as string[];
    const cosmosValues = Object.values(CosmosWallet) as string[];

    console.log('Available EVM wallets:', evmValues);
    console.log('Available Solana wallets:', solValues);
    console.log('Available Cosmos wallets:', cosmosValues);
    console.log('Current networks:', networksConfig.networks);
    console.log('All wallets before filtering:', wallets);

    const filtered = wallets.filter(wallet => {
      const isEvmWallet = evmValues.includes(wallet);
      const isSolWallet = solValues.includes(wallet);
      const isCosmosWallet = cosmosValues.includes(wallet);

      const hasEthereumNetwork = networksConfig.networks?.includes('ETHEREUM');
      const hasSolanaNetwork = networksConfig.networks?.includes('SOLANA');
      const hasCosmosNetwork = networksConfig.networks?.includes('COSMOS');

      const shouldInclude =
        (isEvmWallet && hasEthereumNetwork) || (isSolWallet && hasSolanaNetwork) || (isCosmosWallet && hasCosmosNetwork);

      console.log(`Wallet ${wallet}:`, {
        isEvmWallet,
        isSolWallet,
        isCosmosWallet,
        hasEthereumNetwork,
        hasSolanaNetwork,
        hasCosmosNetwork,
        shouldInclude,
      });

      return shouldInclude;
    });

    console.log('Filtered wallets:', filtered);
    return filtered;
  };

  const getWeb2LayoutIndex = () => {
    const isWeb2Enabled = authenticationConfig.isWeb2AuthEnabled;
    let layout: TAuthLayout | undefined;
    if (isWeb2Enabled) {
      layout = (authenticationConfig.authLayout ?? []).find(l => l === 'AUTH:FULL' || l === 'AUTH:CONDENSED');
    }
    if (!layout) {
      layout = prevWeb2State?.authLayoutWeb2 ?? 'AUTH:FULL';
    }
    return layout === 'AUTH:FULL' ? 0 : 1;
  };

  const getWeb3LayoutIndex = () => {
    const isWeb3Enabled = authenticationConfig.isWeb3AuthEnabled;
    let layout: TAuthLayout | undefined;
    if (isWeb3Enabled) {
      layout = (authenticationConfig.authLayout ?? []).find(l => l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED');
    }
    if (!layout) {
      layout = prevWeb3State?.authLayoutWeb3 ?? 'EXTERNAL:FULL';
    }
    return layout === 'EXTERNAL:FULL' ? 0 : 1;
  };

  function handleWeb2MethodsReorder(newOrder: AuthMethod[]) {
    const updatedOAuthMethods = newOrder.filter(m => m !== 'email-auth' && m !== 'phone-auth');
    const enabledOAuthSet = new Set(authenticationConfig.oAuthMethods ?? []);
    const filtered = updatedOAuthMethods.filter(m => enabledOAuthSet.has(m as TOAuthMethod));
    setAuthMethodsOrder(newOrder);
    setAuthenticationConfig({
      ...authenticationConfig,
      oAuthMethods: filtered as TOAuthMethod[],
    });
  }

  function handleExternalWalletsReorder(newOrder: ExternalWallet[]) {
    const enabledSet = new Set(authenticationConfig.externalWallets ?? []);
    const filtered = newOrder.filter(wallet => enabledSet.has(wallet));
    setExternalWalletsOrder(newOrder);
    setAuthenticationConfig({
      ...authenticationConfig,
      externalWallets: filtered,
    });
  }

  function handleAuthSectionsReorder(newOrder: AuthSectionId[]) {
    const newAuthLayout: TAuthLayout[] = [];
    newOrder.forEach(id => {
      const isWeb2 = id === 'web2';
      const existing = authenticationConfig.authLayout?.find(l =>
        isWeb2 ? l === 'AUTH:FULL' || l === 'AUTH:CONDENSED' : l === 'EXTERNAL:FULL' || l === 'EXTERNAL:CONDENSED',
      );
      if (existing) {
        newAuthLayout.push(existing);
      } else if (isWeb2) {
        newAuthLayout.push(prevWeb2State?.authLayoutWeb2 ?? 'AUTH:FULL');
      } else {
        newAuthLayout.push(prevWeb3State?.authLayoutWeb3 ?? 'EXTERNAL:FULL');
      }
    });
    setAuthSectionOrder(newOrder);
    setAuthenticationConfig({
      ...authenticationConfig,
      authLayout: newAuthLayout,
    });
  }

  const renderWeb2Section = (sectionId: AuthSectionId) => (
    <DraggableItem
      key={sectionId}
      value={sectionId}
      label="Web 2.0"
      isEnabled={authenticationConfig.isWeb2AuthEnabled ?? false}
      onToggle={() => toggleAuthSection('web2')}
      accordion={false}
      isExpanded
      backgroundColor="#f0f0f0"
    >
      <SegmentControl
        items={[
          { icon: 'spacingHeight', label: 'Expanded', value: 'AUTH:FULL' as TAuthLayout },
          { icon: 'alignVerticalCenter', label: 'Collapsed', value: 'AUTH:CONDENSED' as TAuthLayout },
        ]}
        onSelect={value => updateAuthLayout('web2', value as TAuthLayout)}
        defaultSelectedIndex={getWeb2LayoutIndex()}
      />

      <DraggableArea items={authMethodsOrder} onOrderChange={handleWeb2MethodsReorder}>
        {(id, _, isLast) => (
          <DraggableItem
            key={id}
            value={id}
            label={AUTH_METHOD_CONFIGS[id]?.label ?? ''}
            logo={AUTH_METHOD_CONFIGS[id]?.logo}
            isEnabled={
              id === 'email-auth'
                ? !authenticationConfig.disableEmailLogin
                : id === 'phone-auth'
                  ? !authenticationConfig.disablePhoneLogin
                  : (authenticationConfig.oAuthMethods ?? []).includes(id as TOAuthMethod)
            }
            onToggle={() => toggleAuthMethod(id)}
            accordion={false}
            isExpanded={false}
            disabled={!(authenticationConfig.isWeb2AuthEnabled ?? false)}
            backgroundColor="#ffffff"
            padding="0.5rem 0.75rem"
            isLastItem={isLast}
          />
        )}
      </DraggableArea>
    </DraggableItem>
  );

  const renderWeb3Section = (sectionId: AuthSectionId) => (
    <DraggableItem
      key={sectionId}
      value={sectionId}
      label="Web 3.0"
      isEnabled={authenticationConfig.isWeb3AuthEnabled ?? false}
      onToggle={() => toggleAuthSection('web3')}
      accordion={false}
      isExpanded
      backgroundColor="#f0f0f0"
    >
      <SegmentControl
        items={[
          { icon: 'spacingHeight', label: 'Expanded', value: 'EXTERNAL:FULL' as TAuthLayout },
          { icon: 'alignVerticalCenter', label: 'Collapsed', value: 'EXTERNAL:CONDENSED' as TAuthLayout },
        ]}
        onSelect={value => updateAuthLayout('web3', value as TAuthLayout)}
        defaultSelectedIndex={getWeb3LayoutIndex()}
      />

      <DraggableArea items={filteredExternalWallets(externalWalletsOrder)} onOrderChange={handleExternalWalletsReorder}>
        {(wallet, _, isLast) => (
          <DraggableItem
            key={wallet}
            value={wallet}
            label={EXTERNAL_WALLET_CONFIGS[wallet]?.label ?? ''}
            logo={EXTERNAL_WALLET_CONFIGS[wallet]?.logo}
            isEnabled={(authenticationConfig.externalWallets ?? []).includes(wallet)}
            onToggle={() => toggleExternalWallet(wallet)}
            accordion={false}
            isExpanded={false}
            disabled={!(authenticationConfig.isWeb3AuthEnabled ?? false)}
            backgroundColor="#ffffff"
            padding="0.5rem 0.75rem"
            isLastItem={isLast}
          />
        )}
      </DraggableArea>
    </DraggableItem>
  );

  return (
    <AccordionItem value="authentication">
      <AccordionTrigger label="Authentication" secondaryText="Configure login, sign up, and wallet connection options." />
      <AccordionContent>
        <DraggableArea items={authSectionOrder} onOrderChange={handleAuthSectionsReorder}>
          {sectionId => (sectionId === 'web2' ? renderWeb2Section(sectionId) : renderWeb3Section(sectionId))}
        </DraggableArea>
      </AccordionContent>
    </AccordionItem>
  );
};
