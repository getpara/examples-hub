import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import {
  Typography,
  Button,
  Avatar,
  AvatarImage,
  AvatarFallback,
  EVM,
  Solana,
  Cosmos,
  cn,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Loader,
} from '@getpara/react-component-library';
import { AlertCircle, ArrowRight, CheckCircle2, Plus } from 'lucide-react';
import { SaveRecoverySecret } from '@getpara/react-sdk';
import { ComponentProps, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { PARA_CONNECT_DOMAINS } from '../../../constants';
import { WalletWithMetadata, TWalletType, CurrentWalletIds, SupportedWalletTypes, WalletBalance } from '@getpara/web-sdk';
import { usePara, usePortalEmitter } from '../../../components/ParaContext';
import { useLogin } from './LoginProvider';
import { motion } from 'framer-motion';
import { CenteredText } from '@getpara/react-common';
import { isIFramed } from '../../../utils/isIFramed';
import { useExtractedParams } from '../../../hooks/useExtractedParams';

type NewWallets = Partial<Record<TWalletType, WalletWithMetadata[]>>;

const WALLET_GROUPS: Record<TWalletType, { name: string; Icon: ReactNode }> = {
  EVM: {
    name: 'Ethereum',
    Icon: (
      <div className="para:bg-[#627EEA] para:rounded-full para:p-1">
        <EVM className="para:size-4" fill="white" />
      </div>
    ),
  },
  SOLANA: {
    name: 'Solana',
    Icon: (
      <div className="para:bg-black para:rounded-full para:p-1">
        <Solana className="para:size-4" />
      </div>
    ),
  },
  COSMOS: {
    name: 'Cosmos',
    Icon: (
      <div className="para:bg-black para:rounded-full para:p-1">
        <Cosmos className="para:size-4" fill="white" />
      </div>
    ),
  },
};

const contentMotionProps = {
  initial: { opacity: 0, transform: 'translateX(25px)' },
  animate: { opacity: 1, transform: 'none' },
  exit: { opacity: 0, transform: 'translateX(-25px)' },
  transition: { duration: 0.25 },
};

const WalletButton = ({
  wallet,
  disabled,
  onClick,
  isClaimable,
  isSelected,
  addressType,
  balance,
}: {
  addressType: TWalletType;
  wallet: WalletWithMetadata;
  disabled?: boolean;
  onClick?: () => void;
  isClaimable?: boolean;
  isNew?: boolean;
  isSelected?: boolean;
  balance?: WalletBalance;
}) => {
  const para = usePara();
  const { isDark: isDarkTheme } = useModalOutletContext();
  const isDark = isIFramed && isDarkTheme;
  return (
    <ButtonRoot
      isClaimable={isClaimable}
      isSelected={isSelected}
      Icon={
        <Avatar
          className={cn(
            'para:size-10 para:border para:rounded-md',
            isDark ? 'para:border-secondary/20' : 'para:border-border',
          )}
        >
          <AvatarImage src={wallet.partner?.logoUrl} alt={wallet.partner?.name} />
          <AvatarFallback>{wallet.partner?.name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      }
      text={wallet.name}
      textSecondary={wallet.ensName ?? para.getDisplayAddress(wallet.id, { addressType, truncate: true })}
      accessory={balance?.formattedValue}
      key={`${addressType}-${wallet.id}`}
      disabled={disabled}
      onClick={onClick}
    />
  );
};

export const SelectWallet = ({
  onSuccess,
  sessionLookupId,
  isKnownDeviceLogin,
  isSwitchingWallets = false,
}: {
  onSuccess: (_: { withDelay?: boolean }) => void;
  sessionLookupId: string;
  isKnownDeviceLogin: boolean;
  isSwitchingWallets?: boolean;
}) => {
  const para = usePara();
  const portalEmitter = usePortalEmitter();
  const {
    authInfo,
    fns: { authUpdateKeyShares, authUpdateEnclaveKeyShares, checkIsEnclaveUser },
    params: { newDeviceSessionLookupId },
    wallets,
    sessionOrigin,
    loginRes,
    balances,
  } = useLogin();
  const { partner, isDark: isDarkTheme } = useModalOutletContext();
  const isDark = isIFramed && isDarkTheme;
  // Extract currentWalletIds from query string for pre-selection
  const { currentWalletIds: queryCurrentWalletIds } = useExtractedParams<{
    currentWalletIds?: CurrentWalletIds;
  }>();

  const [isSettingUp, setIsSettingUp] = useState(true);

  const textClass = isIFramed && isDark ? 'para:text-white' : undefined;

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

  const { incompleteTypes, isMultiType, walletCount } = useMemo(() => {
    const incompleteTypes = Object.entries(selectedWalletIds).reduce((acc, [type, walletIds]) => {
      const definition = selectWalletTypes.find(({ type: t }) => t === type);
      if (definition?.optional || walletIds.length > 0) {
        return acc;
      }
      return [...acc, type];
    }, []);
    return {
      incompleteTypes,
      isMultiType: Object.values(selectWalletTypes).filter(({ optional }) => !optional).length > 1,
      walletCount: Object.values(selectedWalletIds).flat().length,
    };
  }, [selectedWalletIds, selectWalletTypes]);

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

      // Send wallet switch completion message to parent
      if (isSwitchingWallets) {
        portalEmitter.walletSwitchCompleted({ walletIds: finalWalletIds });
      }

      onSuccess({ withDelay: toCreate.length > 0 && isIFramed });
    },
    [para, onSuccess, loginRes, isSwitchingWallets],
  );

  const { key, content } = useMemo(() => {
    if (isCreatingWallets) {
      return {
        key: 'creating',
        content: (
          <>
            <Loader color="black" className="para:m-auto para:size-25" />
            <Typography className={cn('para:text-lg para:font-medium', textClass)}>Creating wallets...</Typography>
          </>
        ),
      };
    }

    if (!!newWallets && Object.keys(newWallets).length > 0) {
      return {
        key: 'new-wallets',
        content: (
          <>
            <CheckCircle2 className="para:stroke-green-600 para:size-25" />
            <Typography className={cn('para:text-lg para:font-medium', textClass)}>Connected</Typography>
            {recoverySecret && (
              <div className="para:flex para:flex-col para:gap-4 para:p-4 para:border para:border-border para:rounded-lg">
                <div className="para:text-sm para:text-muted-foreground para:text-center para:font-medium">
                  <span className="para:font-bold para:text-red-600">IMPORTANT:</span> Save your recovery secret before
                  closing this window!
                </div>
                <SaveRecoverySecret
                  email={authInfo.authType === 'email' ? authInfo.identifier : undefined}
                  value={recoverySecret}
                  onComplete={() => setIsRecoverySecretSaved(true)}
                />
              </div>
            )}
            {isKnownDeviceLogin && (
              <CenteredText weight="medium" variant="bodyS" color="secondary">
                You can close this window and return to your other device.
              </CenteredText>
            )}
          </>
        ),
      };
    }

    const pregenCount = Object.values(wallets).reduce(
      (acc, arr) => acc + arr.filter(w => w.isPregen && !!w.pregenIdentifier).length,
      0,
    );

    const PartnerLogo = (
      <Avatar className="para:size-16 para:border-border para:border para:rounded-md">
        <AvatarImage src={partner.logoUrl} alt={partner.displayName} />
        <AvatarFallback>{partner.displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
    );

    return {
      key: 'select',
      content: (
        <>
          {partner.homepageUrl ? (
            <Tooltip>
              <TooltipTrigger>{PartnerLogo}</TooltipTrigger>
              <TooltipContent classNames={{ content: 'para:bg-black', arrow: 'para:bg-black para:fill-black' }}>
                <p>{partner.homepageUrl.replace(/^https?:\/\//g, '')}</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            PartnerLogo
          )}
          <div className="para:w-full para:flex para:flex-col para:items-center para:text-center">
            <Typography className={cn('para:text-2xl para:font-semibold', textClass)}>Select wallets</Typography>
            <Typography className={cn('para:text-sm para:text-muted-foreground para:font-medium', textClass)}>
              {pregenCount > 0 ? (
                <>
                  {partner.displayName} has created {pregenCount > 1 ? 'wallets' : 'a wallet'} on your behalf.
                  <br />
                  You can now claim {pregenCount > 1 ? 'these wallets' : 'this wallet'}.
                </>
              ) : (
                'These selections will be set as your default choice for this app.'
              )}
            </Typography>
          </div>
          <div className="para:w-full para:overflow-y-scroll">
            {selectWalletTypes.map(({ type: walletType }) => {
              const { name, Icon } = WALLET_GROUPS[walletType];
              const isCreateNew = selectedWalletIds[walletType]?.includes('CREATE_NEW') || false;
              return (
                <div
                  className="para:flex para:flex-col para:items-center para:justify-start para:gap-1 para:mb-4 para:relative para:flex-1 para:w-full"
                  key={walletType}
                >
                  {isOnlyOneType ? null : (
                    <div
                      className={cn(
                        'para:flex para:items-center para:justify-start para:gap-2 para:px-2 para:mb-1 para:w-full para:p-0',
                        textClass,
                      )}
                    >
                      {Icon}
                      <span>
                        {name}
                        {selectedWalletIds[walletType].length > 0 ? ` (${selectedWalletIds[walletType].length})` : ''}
                      </span>
                    </div>
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
                        balance={
                          walletType !== 'COSMOS' ? balances?.wallets.find(w => w.address === wallet.address) : undefined
                        }
                      />
                    );
                  })}
                  {para.ctx.apiKey && (
                    <ButtonRoot
                      Icon={
                        <div
                          className={cn(
                            'para:flex para:items-center para:justify-center para:size-10 para:border-border para:border para:rounded-md',
                            isDark ? 'para:border-secondary/20' : 'para:border-border',
                          )}
                        >
                          <Plus
                            size={40}
                            className={cn('para:stroke-black', isDark ? 'para:stroke-white' : 'para:stroke-black')}
                          />
                        </div>
                      }
                      text="Create New Wallet"
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
                    />
                  )}
                </div>
              );
            })}
          </div>
        </>
      ),
    };
  }, [
    isCreatingWallets,
    newWallets,
    selectedWalletIds,
    partner,
    wallets,
    recoverySecret,
    isRecoverySecretSaved,
    balances,
    isConnecting,
    isDark,
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
    <TooltipProvider>
      <div
        className={cn(
          'para:flex para:flex-col para:items-center para:justify-top para:py-8 para:gap-4 para:w-full para:max-w-[500px] para:mx-auto',
          isIFramed ? 'para:px-0' : 'para:px-8 para:bg-background',
        )}
      >
        <motion.div
          className="para:flex para:flex-col para:items-center para:justify-start para:gap-2 para:relative para:flex-1 para:w-full"
          key={key}
          {...contentMotionProps}
        >
          <div
            className={cn(
              'para:flex para:flex-col para:items-center para:justify-start para:gap-4 para:relative para:flex-1 para:w-full',
              isIFramed ? 'para:max-h-[520px]' : 'para:mb-[70px]',
            )}
          >
            {content}
          </div>
        </motion.div>
        {!isCreatingWallets && !isCreated && (
          <div
            className={cn(
              'para:fixed para:bottom-0 para:left-0 para:right-0 para:w-full para:shadow-md',
              isIFramed ? 'para:bg-transparent para:pt-3' : 'para:p-3 para:bg-background para:border-t para:border-t-border',
            )}
          >
            <Button
              className={cn('para:w-full para:hover:bg-black/80 para:active:bg-black/80 para:bg-black')}
              onClick={() => onSubmit(selectedWalletIds)}
              disabled={isConnecting || incompleteTypes.length > 0}
              isLoading={isConnecting}
            >
              {!!incompleteTypes[0] ? (
                <>
                  <AlertCircle />
                  {isMultiType ? `Select ${WALLET_GROUPS[incompleteTypes[0]].name} Wallet(s)` : `Select Wallet(s)`}
                </>
              ) : (
                <>
                  {walletCount > 1 ? `Connect ${walletCount} Wallets` : 'Connect Wallet'}
                  <ArrowRight />
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

const ButtonRoot = ({
  className,
  isClaimable,
  isSelected,
  Icon,
  text,
  textSecondary,
  accessory,
  ...props
}: ComponentProps<typeof Button> & {
  isClaimable?: boolean;
  isSelected?: boolean;
  Icon?: ReactNode;
  text?: ReactNode;
  textSecondary?: ReactNode;
  accessory?: ReactNode;
}) => {
  const { isDark: isDarkTheme } = useModalOutletContext();
  const isDark = isIFramed && isDarkTheme;
  const textClass = isDark ? 'para:text-white' : undefined;
  return (
    <Button
      {...props}
      className={cn(
        'para:flex para:h-auto para:items-center para:p-2 para:rounded-lg para:border para:disabled:bg-background-0 para:disabled:border-background-4 para:w-full para:transition-all',
        isIFramed ? 'para:bg-transparent' : 'para:bg-background',
        isSelected
          ? isDark
            ? 'para:border-secondary/20 para:bg-secondary/10'
            : 'para:border-border para:bg-secondary/60'
          : 'para:border-transparent',
        isClaimable
          ? isSelected
            ? 'para:border-primary para:bg-primary/10 para:hover:bg-primary/20'
            : 'para:border-transparent para:bg-primary/10 para:hover:bg-primary/20'
          : isDark
            ? 'para:hover:bg-secondary/20 para:active:bg-secondary/20'
            : 'para:hover:bg-secondary/60 para:active:bg-secondary/60',
        className,
      )}
    >
      {Icon}
      <div className="para:flex para:flex-col para:items-start para:justify-start para:flex-grow">
        <Typography className={cn('para:text-lg para:font-medium', textClass)}>{text}</Typography>
        {textSecondary && (
          <Typography className="para:text-sm para:text-muted-foreground para:font-medium">{textSecondary}</Typography>
        )}
      </div>
      {accessory && <Typography className={cn('para:text-md para:font-medium', textClass)}>{accessory}</Typography>}
    </Button>
  );
};
