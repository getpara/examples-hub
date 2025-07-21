import {
  CpslButton,
  CpslIcon,
  CpslInput,
  CpslSelect,
  CpslSelectItem,
  CpslTab,
  CpslTabs,
  CpslText,
} from '@getpara/react-components';
import {
  EXTERNAL_WALLET_TYPES,
  LinkAccountArgs,
  LINKED_ACCOUNT_TYPES,
  TExternalWallet,
  TLinkedAccountType,
  useLinkAccount,
} from '@getpara/react-sdk';
import { DownIcon, FlexRow, LabelContainer, MethodRow, OptionRow } from './ModalConfig';
import { useEffect, useMemo, useState } from 'react';

type ArgType = 'none' | 'emailAuth' | 'phoneAuth' | 'externalWallet' | 'type' | 'options';

const TABS = {
  none: 'No Args',
  emailAuth: 'Email Auth',
  phoneAuth: 'Phone Auth',
  type: 'Account Type',
  externalWallet: 'External Wallet',
  options: 'Options',
};

const OPTIONS = [...LINKED_ACCOUNT_TYPES, ...EXTERNAL_WALLET_TYPES];

export const AccountLinking = () => {
  const { linkAccount } = useLinkAccount();

  const [args, setArgs] = useState<LinkAccountArgs>(undefined);
  const [tab, setTab] = useState<ArgType>('none');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [externalWalletType, setExternalWalletType] = useState<TExternalWallet>([...EXTERNAL_WALLET_TYPES][0]);
  const [accountType, setAccountType] = useState<TLinkedAccountType>('EMAIL');
  const [options, setOptions] = useState<(TLinkedAccountType | TExternalWallet)[]>([
    ...LINKED_ACCOUNT_TYPES,
    ...EXTERNAL_WALLET_TYPES,
  ]);

  const controls = useMemo(() => {
    switch (tab) {
      case 'none':
        return null;
      case 'emailAuth':
      case 'phoneAuth': {
        const isEmail = tab === 'emailAuth';

        return (
          <CpslInput
            label={isEmail ? 'Email' : 'Phone Number'}
            placeholder={isEmail ? 'Enter email' : 'Enter phone number'}
            value={authIdentifier}
            onCpslInput={e => setAuthIdentifier(e.detail.value)}
          />
        );
      }
      case 'externalWallet':
        return (
          <CpslSelect
            label="External Wallet"
            selectedValue={externalWalletType}
            onCpslSelectValueChange={e => {
              setExternalWalletType(e.detail as TExternalWallet);
            }}
          >
            {EXTERNAL_WALLET_TYPES.map(type => (
              <CpslSelectItem selectedValue={externalWalletType} slot="items" key={type} value={type}>
                {type}
              </CpslSelectItem>
            ))}
          </CpslSelect>
        );

      case 'type':
        return (
          <CpslSelect
            label="Account Type"
            selectedValue={accountType}
            onCpslSelectValueChange={e => {
              setAccountType(e.detail as TLinkedAccountType);
            }}
          >
            {LINKED_ACCOUNT_TYPES.map(type => (
              <CpslSelectItem slot="items" key={type} value={type}>
                {type}
              </CpslSelectItem>
            ))}
          </CpslSelect>
        );

      case 'options':
        return (
          <>
            {options.map((type, index) => (
              <MethodRow key={type}>
                <CpslText>{type}</CpslText>
                <FlexRow>
                  <CpslButton
                    variant="ghost"
                    disabled={index === 0}
                    onClick={() => {
                      setOptions(prev => prev.splice(index - 1, 0, prev.splice(index, 1)[0]));
                    }}
                  >
                    <CpslIcon icon="glow" />
                  </CpslButton>
                  <CpslButton
                    variant="ghost"
                    disabled={index === options.length - 1}
                    onClick={() => {
                      setOptions(prev => prev.splice(index + 1, 0, prev.splice(index, 1)[0]));
                    }}
                  >
                    <DownIcon icon="chevronUp" />
                  </CpslButton>
                  <CpslButton variant="ghost" onClick={() => setOptions(prev => prev.filter(t => t !== type))}>
                    <DownIcon icon="close" />
                  </CpslButton>
                </FlexRow>
              </MethodRow>
            ))}
            <OptionRow>
              {OPTIONS.filter(type => !options.includes(type)).map(type => {
                return (
                  <CpslButton
                    size="small"
                    key={type}
                    variant="primary"
                    onClick={() => {
                      setOptions(prev => [...prev, type]);
                    }}
                  >
                    {type}
                  </CpslButton>
                );
              })}
            </OptionRow>
          </>
        );
    }
  }, [tab, authIdentifier, externalWalletType, accountType, options]);

  useEffect(() => {
    if (tab !== 'emailAuth' && tab !== 'phoneAuth') {
      setAuthIdentifier('');
    }
  }, [tab]);

  useEffect(() => {
    const isEmail = tab === 'emailAuth';

    if (tab === 'emailAuth' || tab === 'phoneAuth') {
      setArgs(isEmail ? { auth: { email: authIdentifier } } : { auth: { phone: authIdentifier as `+${number}` } });
    }
  }, [tab, authIdentifier]);

  useEffect(() => {
    if (tab === 'externalWallet') {
      setArgs({ externalWallet: { internalId: externalWalletType as TExternalWallet } });
    }
  }, [tab, externalWalletType]);

  useEffect(() => {
    if (tab === 'type') {
      setArgs({ type: accountType as Exclude<TLinkedAccountType, 'EXTERNAL_WALLET'> });
    }
  }, [tab, accountType]);

  useEffect(() => {
    if (tab === 'options') {
      setArgs({ options: options as (TLinkedAccountType | TExternalWallet)[] });
    }
  }, [tab, options]);

  return (
    <LabelContainer>
      <CpslText variant="bodyL" weight="semiBold">
        Link Account
      </CpslText>
      <CpslTabs selectedTab={tab} onCpslTabsChanged={e => setTab(e.detail.tab as ArgType)}>
        {Object.entries(TABS).map(([tab, title]) => (
          <CpslTab key={tab} tab={tab}>
            {title}
          </CpslTab>
        ))}
      </CpslTabs>
      {controls}
      <CpslButton
        variant="primary"
        onClick={() => {
          console.log(args);
          linkAccount(args);
        }}
      >
        Link Account
      </CpslButton>
    </LabelContainer>
  );
};
