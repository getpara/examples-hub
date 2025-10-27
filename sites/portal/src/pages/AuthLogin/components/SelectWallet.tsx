import { styled } from 'styled-components';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { CpslIcon, CpslText, CpslButton, IconType, CpslRadio, CpslIdenticon } from '@getpara/react-components';
import { SaveRecoverySecret } from '@getpara/react-sdk';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PARA_CONNECT_DOMAINS } from '../../../constants';
import { Wallet, TWalletType, CurrentWalletIds, WalletEntity, PartnerEntity, SupportedWalletTypes } from '@getpara/web-sdk';
import { usePara, usePortalEmitter } from '../../../components/ParaContext';
import { useLogin } from './LoginProvider';
import { ConnectDiagram, ParaIcon, HERO_HEIGHT, LayoutWithHero, PartnerIcon as PartnerIconRoot } from '../../../components';
import { motion } from 'framer-motion';
import { CenteredText } from '@getpara/react-common';
import { useCloseWindow } from '../../../hooks/useCloseWindow';
import { isIFramed } from '../../../utils/isIFramed';
import { useExtractedParams } from '../../../hooks/useExtractedParams';

const GRADIENT = `linear-gradient(to right, #fe5330, #9400db)`;

interface WalletButtonProps {
  addressType: TWalletType;
  wallet: Wallet | WalletEntity;
  disabled?: boolean;
  onClick?: () => void;
  isClaimable?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
}

type NewWallets = Partial<Record<TWalletType, Wallet[]>>;

const WALLET_GROUPS: Record<TWalletType, [string, IconType]> = {
  EVM: ['Ethereum', 'ethereum'],
  SOLANA: ['Solana', 'solana'],
  COSMOS: ['Cosmos', 'cosmos'],
};

const successIcon = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M55.219 14.1144C56.2604 15.1558 56.2604 16.8442 55.219 17.8856L25.8856 47.2189C24.8442 48.2603 23.1558 48.2603 22.1144 47.2189L8.78105 33.8856C7.73965 32.8442 7.73965 31.1558 8.78105 30.1144C9.82245 29.073 11.5109 29.073 12.5523 30.1144L24 41.5621L51.4477 14.1144C52.4891 13.073 54.1776 13.073 55.219 14.1144Z"
      fill="url(#paint0_linear_681_398)"
    />
    <defs>
      <linearGradient id="paint0_linear_681_398" x1="56" y1="30.6666" x2="8" y2="30.6666" gradientUnits="userSpaceOnUse">
        <stop stop-color="#BC82F3" />
        <stop offset="0.485" stop-color="#FF6778" />
        <stop offset="1" stop-color="#FFBA71" />
      </linearGradient>
    </defs>
  </svg>
);

const contentMotionProps = {
  initial: { opacity: 0, transform: 'translateX(25px)' },
  animate: { opacity: 1, transform: 'none' },
  exit: { opacity: 0, transform: 'translateX(-25px)' },
  transition: { duration: 0.25 },
};

const PartnerIconInline = ({ partner }: { partner: PartnerEntity }) => (
  <PartnerIconRoot size="16px" fontSize="8px" margin="0 3px 0 4px" partner={partner} />
);

const WalletButton = ({ wallet, disabled, onClick, isClaimable, isNew, isSelected, addressType }: WalletButtonProps) => {
  const para = usePara();
  const displayCreation = isNew || !para.ctx.apiKey || !wallet.lastUsedAt;

  const timestamp = useMemo(() => {
    const date = displayCreation ? wallet.createdAt : wallet.lastUsedAt;
    return formatDistanceToNowStrict(typeof date === 'string' ? parseISO(date) : date, {
      addSuffix: true,
    });
  }, [displayCreation, wallet.createdAt, wallet.lastUsedAt]);

  return (
    <WalletButtonRoot
      isClaimable={isClaimable}
      isSelected={isSelected}
      key={`${addressType}-${wallet.id}`}
      disabled={disabled}
      onClick={onClick}
    >
      <WalletButtonContainer>
        <WalletButtonUpper>
          <CpslIdenticon hash={para.getIdenticonHash(wallet.id, addressType)} size="48px" />
          <WalletInfo>
            <WalletName>
              {wallet.name}
              {isClaimable && <WalletClaimable>Claimable</WalletClaimable>}
            </WalletName>
            {wallet.address && (
              <WalletAddress>
                {wallet.ensName ?? para.getDisplayAddress(wallet.id, { addressType, truncate: true })}
              </WalletAddress>
            )}
          </WalletInfo>
        </WalletButtonUpper>
        <WalletButtonLower>
          <div>
            {displayCreation && !!wallet.partner?.displayName ? (
              isNew ? (
                <>
                  <PartnerIconInline partner={wallet.partner} />
                  <span>Just created</span>
                </>
              ) : (
                <>
                  <span>Created on</span>
                  <PartnerIconInline partner={wallet.partner} />
                  <PartnerName>{wallet.partner.displayName}</PartnerName>
                </>
              )
            ) : !!wallet.lastUsedPartner?.displayName ? (
              <>
                Last used on <PartnerIconInline partner={wallet.lastUsedPartner} />
                <PartnerName>{wallet.lastUsedPartner.displayName}</PartnerName>
              </>
            ) : null}
          </div>
          {!isNew && <div>{timestamp}</div>}
        </WalletButtonLower>
      </WalletButtonContainer>
      {!disabled && <WalletButtonRadio checked={isSelected} />}
    </WalletButtonRoot>
  );
};

export const SelectWallet = ({
  onSuccess,
  sessionLookupId,
  isKnownDeviceLogin,
  isSwitchingWallets = false,
}: {
  onSuccess: (_: { withDelay?: boolean; isEnclaveUser: boolean; shouldSkipBasicLoginUpgradePrompt: boolean }) => void;
  sessionLookupId: string;
  isKnownDeviceLogin: boolean;
  isSwitchingWallets?: boolean;
}) => {
  const para = usePara();
  const portalEmitter = usePortalEmitter();
  const {
    authInfo,
    fns: { authUpdateKeyShares, authUpdateEnclaveKeyShares, checkIsEnclaveUser, getSkipBasicLoginUpgradePromptPreference },
    params: { newDeviceSessionLookupId },
    wallets,
    sessionOrigin,
    loginRes,
  } = useLogin();
  const { partner } = useModalOutletContext();
  const closeWindow = useCloseWindow();
  // Extract currentWalletIds from query string for pre-selection
  const { currentWalletIds: queryCurrentWalletIds } = useExtractedParams<{
    currentWalletIds?: CurrentWalletIds;
  }>();

  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(true);
  const divRef = useRef(null);

  const onScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = divRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 60) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  };

  const selectWalletTypes = useMemo<SupportedWalletTypes>(() => {
    return para.supportedWalletTypes.sort(({ type }) => (wallets[type].some(w => w.isPregen) ? -1 : 0));
  }, [wallets, para.supportedWalletTypes]);

  const isOnlyOneType = selectWalletTypes.length === 1;

  const [selectedWalletIds, setSelectedWalletIds] = useState<CurrentWalletIds>(
    selectWalletTypes.reduce((acc, { type }) => {
      return {
        ...acc,
        [type]: queryCurrentWalletIds?.[type] || [],
      };
    }, {}),
  );

  const [isCreatingWallets, setIsCreatingWallets] = useState(false);
  const [newWallets, setNewWallets] = useState<NewWallets>({});
  const [recoverySecret, setRecoverySecret] = useState<string | undefined>();
  const [isRecoverySecretSaved, setIsRecoverySecretSaved] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const isIncomplete = isOnlyOneType
    ? selectedWalletIds[selectWalletTypes[0].type].length === 0
    : selectWalletTypes.reduce((acc, { type, optional }) => {
        if (optional) {
          return acc;
        }

        return acc || selectedWalletIds[type].length === 0;
      }, false);

  const walletCount = Object.values(selectedWalletIds).flat().length;

  const onSubmit = useCallback(
    async (walletIds: CurrentWalletIds) => {
      setIsConnecting(true);

      // Ensure isEnclaveUser is set before creating wallets so key shares are distributed correctly
      const isEnclaveUser = await checkIsEnclaveUser();

      const toCreate = Object.keys(walletIds).filter(type => walletIds[type].includes('CREATE_NEW')) as TWalletType[];

      let createdIds: CurrentWalletIds = {};
      if (toCreate.length > 0) {
        if (!para.ctx.apiKey) {
          return;
        }

        setIsCreatingWallets(true);

        let newRecoverySecret: string | undefined;

        const created = await para.createWalletPerType({ types: toCreate });

        createdIds = Object.entries(created.walletIds)
          .filter(([type]) => walletIds[type].includes('CREATE_NEW'))
          .reduce((acc, [type, walletIds]) => ({ ...acc, [type]: walletIds }), {});

        setNewWallets(
          Object.entries(createdIds).reduce((acc, [type, walletIds]) => {
            const wallets = walletIds.map(walletId => {
              const wallet = Object.values(para.wallets).find(({ id }) => id === walletId);

              return {
                ...wallet,
                partner,
                name: `${partner?.displayName ?? 'New'} Wallet`,
              };
            });

            return { ...acc, [type]: wallets };
          }, {}),
        );

        if (created.recoverySecret) {
          newRecoverySecret = JSON.parse(recoverySecret || '{}').backupDecryptionKey;

          setRecoverySecret(newRecoverySecret);
        }

        setIsCreatingWallets(false);
      }

      // Replace 'CREATE_NEW' with actual created wallet IDs
      const finalWalletIds = Object.entries(walletIds).reduce((acc, [type, walletIds]) => {
        const finalIds = walletIds.map(id => {
          if (id === 'CREATE_NEW') {
            // Find the created wallet ID for this type
            const createdId = createdIds[type]?.[0];
            return createdId || id; // Fallback to 'CREATE_NEW' if not found
          }
          return id;
        });
        return { ...acc, [type]: finalIds };
      }, {} as CurrentWalletIds);

      await para.setCurrentWalletIds(finalWalletIds, { sessionLookupId, newDeviceSessionLookupId });

      // Update key shares for the newly selected wallets (including any newly created ones)
      await (isEnclaveUser ? authUpdateEnclaveKeyShares() : authUpdateKeyShares(loginRes));
      const shouldSkipBasicLoginUpgradePrompt = await getSkipBasicLoginUpgradePromptPreference();

      // Send wallet switch completion message to parent
      if (isSwitchingWallets) {
        portalEmitter.walletSwitchCompleted({ walletIds: finalWalletIds });
      }

      onSuccess({ withDelay: toCreate.length > 0 && isIFramed, isEnclaveUser, shouldSkipBasicLoginUpgradePrompt });
    },
    [para, onSuccess, isSwitchingWallets],
  );

  const [key, header, heading, subheading, content] = useMemo(() => {
    const isMany =
      Object.values(selectedWalletIds)
        .flat()
        .filter(id => id === 'CREATE_NEW').length > 1;
    if (isCreatingWallets) {
      return ['creating', null, `Creating Wallet${isMany ? 's' : ''}...`, null, null];
    }

    if (!!newWallets && Object.keys(newWallets).length > 0) {
      return [
        'success',
        <Success>{successIcon}</Success>,
        `Wallet${isMany ? 's' : ''} Created`,
        null,
        <FlexColumn style={{ marginTop: '16px' }}>
          {Object.entries(newWallets).map(([walletType, wallets]) => {
            return (
              <>
                {wallets.map(wallet =>
                  wallet ? (
                    <WalletButton
                      addressType={walletType as TWalletType}
                      key={`${wallet.id}-${walletType}`}
                      wallet={wallet}
                      disabled
                      isNew
                    />
                  ) : null,
                )}
              </>
            );
          })}
          {recoverySecret && (
            <RecoverySecretContainer>
              <RecoverySecretInstructions>
                <span>IMPORTANT:</span> Save your recovery secret before closing this window!
              </RecoverySecretInstructions>
              <SaveRecoverySecret
                email={authInfo.authType === 'email' ? authInfo.identifier : undefined}
                value={recoverySecret}
                onComplete={() => setIsRecoverySecretSaved(true)}
              />
            </RecoverySecretContainer>
          )}
          {isKnownDeviceLogin ? (
            <CenteredText weight="medium" variant="bodyS" color="secondary">
              You can close this window and return to your other device.
            </CenteredText>
          ) : (
            <CpslButton fullWidth disabled={!!recoverySecret && !isRecoverySecretSaved} onClick={closeWindow}>
              Done
            </CpslButton>
          )}
        </FlexColumn>,
      ];
    }

    const pregenCount = Object.values(wallets).reduce(
      (acc, arr) => acc + arr.filter(w => w.isPregen && !!w.pregenIdentifier).length,
      0,
    );

    return [
      'select',
      <ConnectDiagram left={<ParaIcon icon="paraIcon" />} right={<PartnerIconRoot partner={partner} fontSize="24px" />} />,
      `Connect to ${partner.displayName}`,
      pregenCount > 0 ? (
        <>
          {partner.displayName} has created {pregenCount > 1 ? 'wallets' : 'a wallet'} on your behalf.
          <br />
          You can now claim {pregenCount > 1 ? 'these wallets' : 'this wallet'}.
        </>
      ) : para.ctx.apiKey ? (
        'Choose an existing wallet or create a new one.'
      ) : (
        'Choose an existing wallet.'
      ),
      <WalletsContainer>
        <Wallets isAtBottom={isAtBottom} ref={divRef} onScroll={onScroll}>
          {selectWalletTypes.map(({ type: walletType }) => {
            const isCreateNew = selectedWalletIds[walletType]?.includes('CREATE_NEW') || false;
            return (
              <FlexColumn key={walletType}>
                {isOnlyOneType ? null : (
                  <WalletGroupHeading>
                    <CpslIcon icon={WALLET_GROUPS[walletType][1]} />
                    <span>{WALLET_GROUPS[walletType][0]} Wallets</span>
                  </WalletGroupHeading>
                )}
                {wallets[walletType].map(wallet => {
                  const isClaimable = wallet.isPregen && !!wallet.pregenIdentifier;
                  return (
                    <WalletButton
                      key={wallet.id}
                      addressType={walletType}
                      wallet={wallet}
                      onClick={() => {
                        setSelectedWalletIds(prev => {
                          const currentSelection = prev[walletType] || [];
                          const isCurrentlySelected = currentSelection.includes(wallet.id);

                          if (isCurrentlySelected) {
                            // Remove wallet from selection
                            return {
                              ...prev,
                              [walletType]: currentSelection.filter(id => id !== wallet.id),
                            };
                          } else {
                            // Add wallet to selection, but first remove 'CREATE_NEW' if it exists
                            const filteredSelection = currentSelection.filter(id => id !== 'CREATE_NEW');
                            return {
                              ...prev,
                              [walletType]: [...filteredSelection, wallet.id],
                            };
                          }
                        });
                      }}
                      isClaimable={isClaimable}
                      isSelected={selectedWalletIds[walletType]?.includes(wallet.id) || false}
                    />
                  );
                })}
                {para.ctx.apiKey && (
                  <ButtonRoot
                    isSelected={isCreateNew}
                    onClick={() => {
                      if (!isCreateNew) {
                        // When "Create New" is selected, deselect all other wallets in this type
                        setSelectedWalletIds(prev => ({ ...prev, [walletType]: ['CREATE_NEW'] }));
                      } else {
                        // When "Create New" is deselected, clear the selection for this type
                        setSelectedWalletIds(prev => ({ ...prev, [walletType]: [] }));
                      }
                    }}
                  >
                    <CreateWalletContainer>
                      <CreateWalletIcon>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5Z"
                            fill="var(--cpsl-color-background-0)"
                          />
                        </svg>
                      </CreateWalletIcon>
                      <CreateWalletText>Create New Wallet</CreateWalletText>
                      <WalletButtonRadio checked={isCreateNew} />
                    </CreateWalletContainer>
                  </ButtonRoot>
                )}
              </FlexColumn>
            );
          })}
        </Wallets>
      </WalletsContainer>,
    ];
  }, [
    isCreatingWallets,
    newWallets,
    selectedWalletIds,
    partner,
    wallets,
    recoverySecret,
    isRecoverySecretSaved,
    isAtBottom,
  ]);

  const isCreated = Object.values(newWallets).length > 0;

  useEffect(() => {
    const setup = async () => {
      // Situation where user has wallets, but none of the supported type (EVM/SOLANA)
      if (selectWalletTypes.every(({ type }) => wallets[type].length === 0)) {
        await onSubmit(selectWalletTypes.reduce((acc, { type }) => ({ ...acc, [type]: ['CREATE_NEW'] }), {}));
      }
      // If coming from Para Connect load all wallets
      if (partner.id === import.meta.env.VITE_PARA_CONNECT_PARTNER_ID && PARA_CONNECT_DOMAINS().includes(sessionOrigin)) {
        await onSubmit(selectWalletTypes.reduce((acc, { type }) => ({ ...acc, [type]: wallets[type].map(w => w.id) }), {}));
      }
      setIsSettingUp(false);
    };

    setup();
  }, [wallets, selectWalletTypes]);

  if (isSettingUp) {
    return null;
  }

  return (
    <Root>
      <Container>
        <LayoutWithHero hero={header} state={!!newWallets && Object.keys(newWallets).length > 0 ? 'success' : 'loading'}>
          <FlexColumn key={key} {...contentMotionProps}>
            <PageHeading>
              <CpslText variant="bodyL" weight="semiBold">
                {heading}
              </CpslText>
              {subheading && (
                <CpslText variant="bodyS" color="secondary">
                  {subheading}
                </CpslText>
              )}
            </PageHeading>
            <FlexColumn>{content}</FlexColumn>
          </FlexColumn>
        </LayoutWithHero>
      </Container>
      {!isCreatingWallets && !isCreated && (
        <BottomSheet>
          <CpslButton fullWidth onClick={() => onSubmit(selectedWalletIds)} disabled={isIncomplete || isConnecting}>
            {walletCount > 1 ? `Connect ${walletCount} Wallets` : 'Connect Wallet'}
            <CpslIcon icon="arrow" />
          </CpslButton>
          <Notice>{partner.displayName} will be able to view the selected wallets' activity and balances.</Notice>
        </BottomSheet>
      )}
    </Root>
  );
};

export function CreateWalletButton({ isSelected, onClick }: Pick<WalletButtonProps, 'isSelected' | 'onClick'>) {
  return (
    <ButtonRoot isSelected={isSelected} onClick={onClick}>
      <CreateWalletContainer>
        <CreateWalletIcon>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5V11H5C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13H11V19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19V13H19C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11H13V5Z"
              fill="var(--cpsl-color-background-0)"
            />
          </svg>
        </CreateWalletIcon>
        <CreateWalletText>Create New Wallet</CreateWalletText>
        <WalletButtonRadio checked={isSelected} />
      </CreateWalletContainer>
    </ButtonRoot>
  );
}

const PAGE_HEADING_HEIGHT = 72;
const BOTTOM_SHEET_HEIGHT = 156;

const Root = styled.div`
  height: 100vh;
  min-height: 500px;
  width: 456px;
  max-width: 100vw;
  background-color: var(--cpsl-color-background-0);
`;

const FlexColumn = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  flex: 1;
`;

const WalletsContainer = styled(FlexColumn)`
  flex: 1;
  position: relative;
  bottom: 0;
`;

const Wallets = styled(FlexColumn)<{ isAtBottom?: boolean }>`
  margin-top: 8px;
  position: relative;
  overflow-y: auto;
  /* max-height: calc(100vh - ${BOTTOM_SHEET_HEIGHT}px - ${HERO_HEIGHT}px - ${PAGE_HEADING_HEIGHT}px - 32px); */
  max-height: calc(100vh - ${BOTTOM_SHEET_HEIGHT}px - ${isIFramed ? 0 : HERO_HEIGHT}px - ${PAGE_HEADING_HEIGHT}px - 32px);
  width: 100%;
  gap: 32px;
  mask-image: ${({ isAtBottom }) =>
    isAtBottom ? 'none' : 'linear-gradient(to bottom, black calc(100% - 24px), transparent 100%)'};
`;

const Container = styled(FlexColumn)`
  padding-left: 12px;
  padding-right: 12px;
  height: 100%;
`;

const PageHeading = styled(FlexColumn)`
  min-height: 72px;
  justify-content: flex-start;
  flex: 0;
`;

const WalletGroupHeading = styled.div`
  color: var(--cpsl-color-foreground-0, #0a0a0a);
  font-size: var(--Typography-Text-L, 20px);
  font-size: 20px;
  font-weight: 500;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  gap: 8px;
  position: sticky;
  top: 0px;
  z-index: 1000;
  padding: 0 0 4px 0;

  --icon-width: 20px;
  --icon-height: 20px;
`;

const BottomSheet = styled.div`
  width: 100vw;
  padding: 32px calc(50vw - 218px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: ${BOTTOM_SHEET_HEIGHT}px;
  border-radius: 24px 24px 0px 0px;
  background: var(--cpsl-color-background-0);
  box-shadow: 0px -8px 6px 0px rgba(0, 0, 0, 0.04);
`;

const Notice = styled.div`
  font-size: 12px;
  text-align: center;
  color: var(--cpsl-color-text-primary);
`;

const ButtonRoot = styled.button<Pick<WalletButtonProps, 'isSelected'>>`
  padding: 24px;
  background-color: var(--cpsl-color-background-0);
  border-radius: 16px;
  border: 1px solid;
  display: flex;
  align-items: center;
  width: 100%;
  border-color: ${({ isSelected }) => (isSelected ? 'var(--cpsl-color-foreground-0)' : 'var(--cpsl-color-background-32)')};
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.04);

  &:hover {
    background-color: var(--cpsl-color-background-4);
  }

  &:active {
    background-color: var(--cpsl-color-background-4);
  }

  &:disabled {
    cursor: default;
    background-color: var(--cpsl-color-background-0);
    border-color: var(--cpsl-color-background-4);

    &:hover {
      background-color: var(--cpsl-color-background-0);
    }
  }
`;

const WalletButtonRoot = styled(ButtonRoot)<Pick<WalletButtonProps, 'isClaimable'>>`
  height: 128px;
  position: relative;

  ${({ isClaimable }) =>
    isClaimable
      ? `
      border-color: transparent;
      background: linear-gradient(white, white) padding-box, ${GRADIENT} border-box;

      &:hover {
        background: linear-gradient(#f5f5f5, #f5f5f5) padding-box, ${GRADIENT} border-box;
      }
    `
      : ''};
`;

const WalletButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  width: calc(100% - 20px);
`;

const WalletButtonUpper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  gap: 8px;
  align-items: center;
  justify-content: start;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 4px;
  max-width: calc(100% - 68px);
`;

const WalletName = styled.div`
  color: var(--cpsl-color-text-primary);
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
`;

const WalletAddress = styled.div`
  font-size: 12px;
  color: var(--cpsl-color-text-secondary);
`;

const WalletTag = styled.div`
  border-radius: 4px;
  color: var(--cpsl-color-text-tertiary);
  padding: 2px 4px;
  font-weight: 500;
  font-size: 10px;
  line-height: 1;
  display: inline-block;
  margin-left: 8px;
  position: relative;
  top: -3px;
`;

const WalletClaimable = styled(WalletTag)`
  color: var(--cpsl-color-text-primary);
  background: ${GRADIENT};
`;

const WalletButtonLower = styled(WalletButtonUpper)`
  font-size: 12px;
  gap: 0px;

  & > div {
    display: flex;
    align-items: center;
    color: var(--cpsl-color-text-secondary);
    text-align: left;
    white-space: nowrap;

    img {
      width: 16px;
      height: 16px;
    }

    &:not(:last-child) {
      @media screen and (max-width: 432px) {
        display: none;
      }

      &::after {
        content: '•';
        margin: 0 6px;
      }
    }
  }
`;

const PartnerName = styled.span`
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`;

const WalletButtonRadio = styled(CpslRadio)`
  position: absolute;
  right: 24px;
`;

const CreateWalletContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
  align-items: center;
`;

const CreateWalletIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: var(--cpsl-color-foreground-0);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CreateWalletText = styled.div`
  flex-grow: 1;
  font-size: 20px;
  font-weight: 500;
  text-align: left;
  color: var(--cpsl-color-text-primary);
`;

const Success = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecoverySecretContainer = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 16px;
  padding: 12px 8px;
  border: 1px solid var(--cpsl-color-background-8);
  border-radius: 16px;
`;

const RecoverySecretInstructions = styled.div`
  font-size: 14px;
  color: var(--cpsl-color-text-secondary);
  text-align: center;

  & span {
    font-weight: bold;
    color: var(--cpsl-color-utility-red);
  }
`;
