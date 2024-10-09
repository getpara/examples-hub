import { CpslRow, CpslText, IconType } from '@usecapsule/react-components';
import { Controller } from 'react-hook-form';
import { useSupportedWalletTypesFormData } from '../../hooks/useSupportedWalletTypesFormData';
import { SupportedWalletTypes, WalletType } from '@usecapsule/react-sdk';
import { DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { FormProvider } from 'react-hook-form';
import { BrandIcon, InnerInput } from '../OnRampConfiguration/common';
import { ArraySelect } from '../../../../components/ArraySelect';
import styled from 'styled-components';
import { GreenSwitch, SectionCard } from '../common';
import { ConfigurationActions } from '../ConfigurationActions';

const WALLET_TYPES: Record<WalletType, { name: string; icon: IconType }> = {
  [WalletType.EVM]: { name: 'EVM', icon: 'ethereum' },
  [WalletType.SOLANA]: { name: 'Solana', icon: 'solana' },
  [WalletType.COSMOS]: { name: 'Cosmos', icon: 'cosmos' },
};

export const SupportedWalletTypesConfiguration = () => {
  const form = useSupportedWalletTypesFormData();

  return (
    <ConfigurationCard
      title="Supported Wallet Types"
      subtitle={
        <>
          Configure the wallet types your app supports.
          <br />
          <br />
          When a new user signs up on your app, Capsule will automatically provision a new wallet for each{' '}
          <b>non-optional</b> type you specify. Cross-app users who sign into your app will be required to connect or create
          a new wallet of each non-optional type, and will also be permitted to connect or create wallets for each optional
          type.
          <br />
          <br />
          The order of the wallet types will determine the order in which they are displayed in the login screen and in the
          Capsule Modal dropdown menu after signing in. The wallet initially displayed in the modal after signing in will
          default to the first wallet type in the list.
        </>
      }
      // TODO: customize the docs link
      docsLink={DOCS_LINK}
    >
      <FormProvider {...form}>
        <Controller
          name="supportedWalletTypes"
          rules={{
            validate: {
              isCorrectForm: (value?: SupportedWalletTypes) => {
                return (
                  (!!value &&
                    value.length > 0 &&
                    value.every(({ type }) => !!WalletType[type]) &&
                    value.some(({ optional }) => !optional)) ||
                  'At least one non-optional wallet type is required.'
                );
              },
            },
          }}
          render={({ field: { onChange: setSupportedWalletTypes, value: supportedWalletTypes }, fieldState }) => {
            return (
              <Controller
                name="cosmosPrefix"
                rules={{
                  validate: {
                    isNotEmpty: value => value?.length > 0 || 'Cosmos address prefix is required.',
                  },
                }}
                render={({ field: { onChange: setCosmosPrefix, onBlur, value: cosmosPrefix }, fieldState: { error } }) => {
                  const valueWithRemaining: SupportedWalletTypes = [
                    ...supportedWalletTypes,
                    ...Object.keys(WalletType)
                      .filter(key => !(supportedWalletTypes as SupportedWalletTypes).some(({ type }) => key === type))
                      .map(type => ({ type })),
                  ];

                  return (
                    <SectionCard>
                      <Controls>
                        <ArraySelect<WalletType, []>
                          ifEmpty={[]}
                          isOrderable
                          error={fieldState.error?.message}
                          value={valueWithRemaining.map(({ type }) => type)}
                          remaining={[]}
                          onChange={items => {
                            setSupportedWalletTypes(
                              items
                                .filter(item =>
                                  (supportedWalletTypes as SupportedWalletTypes).some(entry => entry.type === item),
                                )
                                .map(
                                  type => (supportedWalletTypes as SupportedWalletTypes).find(entry => entry.type === type)!,
                                ),
                            );
                          }}
                          rowTitle={type => {
                            const isIncluded = (supportedWalletTypes as SupportedWalletTypes).some(
                              entry => entry.type === type,
                            );

                            return (
                              <Row>
                                <Row>
                                  <BrandIcon icon={WALLET_TYPES[type].icon} />
                                  <CpslText variant="bodyM" style={{ fontWeight: '600' }}>
                                    {WALLET_TYPES[type].name}
                                  </CpslText>
                                </Row>
                                <GreenSwitch
                                  checked={isIncluded}
                                  onClick={e => {
                                    const isChecked = e.currentTarget.checked;
                                    const newValue = isChecked
                                      ? (() => {
                                          const filtered = (supportedWalletTypes as SupportedWalletTypes).filter(
                                            entry => entry.type !== type,
                                          );

                                          return filtered.length > 1
                                            ? filtered
                                            : filtered.map(entry => ({ ...entry, optional: false }));
                                        })()
                                      : [...supportedWalletTypes, { type, optional: false }];

                                    setSupportedWalletTypes(newValue);
                                  }}
                                />
                              </Row>
                            );
                          }}
                          rowChild={type => {
                            const [isIncluded, isMulti, isCosmos] = [
                              (supportedWalletTypes as SupportedWalletTypes).some(entry => entry.type === type),
                              supportedWalletTypes.length > 1,
                              type === WalletType.COSMOS,
                            ];

                            if (isIncluded && (isMulti || isCosmos)) {
                              const isOptional =
                                (supportedWalletTypes as SupportedWalletTypes).find(entry => entry.type === type)
                                  ?.optional ?? false;

                              return (
                                <Controls>
                                  {isMulti && (
                                    <Required>
                                      <CpslText style={{ flex: '1 1', fontSize: '14px' }} variant="bodyM">
                                        {isOptional ? 'Optional' : 'Required'}
                                      </CpslText>
                                      <GreenSwitch
                                        checked={!isOptional}
                                        onClick={e => {
                                          const isChecked = e.currentTarget.checked;
                                          const newValue = (supportedWalletTypes as SupportedWalletTypes).map(entry =>
                                            entry.type === type ? { ...entry, optional: isChecked } : entry,
                                          );

                                          setSupportedWalletTypes(newValue);
                                        }}
                                      />
                                    </Required>
                                  )}
                                  {isCosmos && (
                                    <InnerInput
                                      label="Address Prefix"
                                      placeholder="cosmos"
                                      onCpslInput={e => {
                                        setCosmosPrefix(e.detail.value);
                                      }}
                                      onCpslPaste={e => {
                                        setCosmosPrefix(e.detail.clipboardData?.getData('text'));
                                      }}
                                      onCpslBlur={onBlur}
                                      value={cosmosPrefix ?? ''}
                                      errorText={error?.message}
                                    />
                                  )}
                                </Controls>
                              );
                            }
                            return null;
                          }}
                        />
                      </Controls>
                      {fieldState.error?.message && (
                        <Error color="error" variant="bodyS">
                          {fieldState.error?.message ?? null}
                        </Error>
                      )}
                    </SectionCard>
                  );
                }}
              />
            );
          }}
        />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};

const Required = styled(CpslRow)`
  align-items: center;
  flex: 1;
  border: 1px solid #bbb;
  border-radius: 12px;
  padding: 8px 12px;
`;

const Row = styled(CpslRow)`
  align-items: center;
  gap: 8px;
  flex: 1 1;
`;

const Error = styled(CpslText)`
  min-height: 22px;
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
