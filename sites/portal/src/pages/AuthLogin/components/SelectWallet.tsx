import { styled } from 'styled-components';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';
import { CpslIcon, CpslText, CpslButton, CpslDivider } from '@usecapsule/react-components';
import { SaveRecoverySecret } from '@usecapsule/react-sdk';
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthLoginStep } from '../../../constants';
import { useAuthLoginStep } from '../../../hooks/useLoginStep';
import { Wallet as WalletType } from '@usecapsule/web-sdk';
import { Identicon } from '../../../components/Identicon';
import { useCapsule } from '../../../components/CapsuleContext';
import { useLogin } from './LoginProvider';
import { PartnerIcon } from '../../../components/PartnerIcon';
import { ConnectDiagram, capsuleIcon } from '../../../components/ConnectDiagram';
import { LayoutWithHero } from '../../../components/Hero';
import { motion } from 'framer-motion';

const GRADIENT = `linear-gradient(to right, #fe5330, #9400db)`;

type Wallet = Pick<
  WalletType,
  'id' | 'type' | 'address' | 'name' | 'partner' | 'createdAt' | 'lastUsedAt' | 'lastUsedPartner'
>;

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

const WalletButton = ({
  wallet,
  disabled,
  onClick,
  isClaimable,
  isMostRecent,
  isNew,
}: {
  wallet: Wallet;
  disabled?: boolean;
  onClick?: () => void;
  isClaimable?: boolean;
  isMostRecent?: boolean;
  isNew?: boolean;
}) => {
  const capsule = useCapsule();
  const displayAddress = capsule.getDisplayAddress(wallet.id, { truncate: true });

  return (
    <WalletButtonRoot isClaimable={isClaimable} key={wallet.id} disabled={disabled} onClick={onClick}>
      <WalletButtonContainer>
        <WalletButtonUpper>
          <Identicon address={wallet.address} size="32px" />
          <WalletInfo>
            <WalletName>{wallet.name}</WalletName>
            {displayAddress && <WalletAddress>{displayAddress}</WalletAddress>}
          </WalletInfo>

          {isMostRecent && <WalletTag>Most Recent</WalletTag>}
          {isClaimable && <WalletClaimable>Claimable</WalletClaimable>}
        </WalletButtonUpper>
        <WalletButtonLower>
          {(wallet.createdAt || isNew) && (
            <div>
              {wallet.partner && <PartnerIcon size="16px" margin="0 4px 0 0" fontSize="8px" partner={wallet.partner} />}
              <span>{isNew ? 'Just created' : `Created on ${format(parseISO(wallet.createdAt), 'P')}`}</span>
            </div>
          )}
          {capsule.ctx.apiKey && wallet.lastUsedAt && (
            <div>
              {wallet.lastUsedPartner && (
                <PartnerIcon size="16px" margin="0 4px 0 0" fontSize="8px" partner={wallet.lastUsedPartner} />
              )}
              <span>Last used {formatDistanceToNowStrict(parseISO(wallet.lastUsedAt), { addSuffix: true })}</span>
            </div>
          )}
        </WalletButtonLower>
      </WalletButtonContainer>
    </WalletButtonRoot>
  );
};

export const SelectWallet = ({ sessionLookupId }: { sessionLookupId: string }) => {
  const capsule = useCapsule();
  const {
    fns: { finishLogin },
    params: { email },
    wallets,
    pregenWallets,
  } = useLogin();
  const [, setStep] = useAuthLoginStep();
  const { partner, isDark } = useModalOutletContext();

  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [newWallet, setNewWallet] = useState<Wallet | undefined>();
  const [recoverySecret, setRecoverySecret] = useState<string | undefined>();
  const [isRecoverySecretSaved, setIsRecoverySecretSaved] = useState(false);

  const onSelectWallet = useCallback(
    async (walletId: string) => {
      await capsule.setCurrentWalletIds([walletId], sessionLookupId);
      setStep(AuthLoginStep.SUCCESS);
    },
    [capsule],
  );

  const onCreateWallet = useCallback(async () => {
    if (!capsule.ctx.apiKey) {
      return;
    }

    setIsCreatingWallet(true);

    const [newWallet, recoverySecret] = await capsule.createWallet();

    await capsule.setCurrentWalletIds([newWallet.id], sessionLookupId);

    setIsCreatingWallet(false);
    setNewWallet({ ...capsule.wallets[newWallet.id], name: `Wallet ${wallets.length + 1}`, partner });

    let newRecoverySecret: string | undefined;
    if (recoverySecret) {
      newRecoverySecret = JSON.parse(recoverySecret || '{}').backupDecryptionKey;

      setRecoverySecret(newRecoverySecret);
    }

    finishLogin();
  }, [capsule, wallets, partner]);

  const [key, header, heading, content] = useMemo(() => {
    if (isCreatingWallet) {
      return ['creating', null, 'Creating Wallet...', null];
    }

    if (newWallet) {
      return [
        'success',
        <Success>{successIcon}</Success>,
        'Wallet Created',
        <FlexColumn style={{ marginTop: '16px' }}>
          <WalletButton wallet={newWallet} disabled isNew />
          {recoverySecret && (
            <RecoverySecretContainer>
              <RecoverySecretInstructions>
                <span>IMPORTANT:</span> Save your recovery secret before closing this window!
              </RecoverySecretInstructions>
              <SaveRecoverySecret email={email} value={recoverySecret} onComplete={() => setIsRecoverySecretSaved(true)} />
            </RecoverySecretContainer>
          )}
          <CpslButton fullWidth disabled={!!recoverySecret && !isRecoverySecretSaved} onClick={() => window.close()}>
            Done
          </CpslButton>
        </FlexColumn>,
      ];
    }

    const isMostRecentFromApp = wallets[0]?.partner?.id === partner.id;
    const isPregenAvailable = pregenWallets?.length > 0;

    return [
      'select',
      <ConnectDiagram left={capsuleIcon} right={<PartnerIcon partner={partner} fontSize="24px" />} />,
      `Connect to ${partner.displayName}`,
      <WalletsContainer>
        <Subheading isDark={isDark}>
          <span>
            {isPregenAvailable ? (
              <>
                {partner.displayName} has created a wallet on your behalf.
                <br />
                You can now claim this wallet.
              </>
            ) : isMostRecentFromApp ? (
              'Welcome back! Continue with your previous wallet:'
            ) : capsule.ctx.apiKey ? (
              'Choose an existing wallet or create a new one.'
            ) : (
              'Choose an existing wallet.'
            )}
          </span>
        </Subheading>

        <Wallets>
          {isPregenAvailable && (
            <>
              <WalletButton wallet={pregenWallets[0]} onClick={() => onSelectWallet(pregenWallets[0].id)} isClaimable />
              <Divider key={'orUseAnotherWallet'}>or use another wallet</Divider>
            </>
          )}
          {wallets[0] && (
            <WalletButton
              wallet={wallets[0]}
              onClick={() => onSelectWallet(wallets[0].id)}
              // isMostRecent={!isMostRecentFromApp || isPregenAvailable}
              isMostRecent
            />
          )}
          {isMostRecentFromApp && !isPregenAvailable && (
            <Divider key={'orUseAnotherWallet'}>other available wallets</Divider>
          )}
          {wallets.slice(1).map(wallet => {
            return <WalletButton key={wallet.id} wallet={wallet} onClick={() => onSelectWallet(wallet.id)} />;
          })}
          {capsule.ctx.apiKey && (
            <ButtonRoot onClick={onCreateWallet}>
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
                <CpslIcon icon="arrow" />
              </CreateWalletContainer>
            </ButtonRoot>
          )}
        </Wallets>

        <Notice>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.42012 12.7132C2.28394 12.4975 2.21584 12.3897 2.17772 12.2234C2.14909 12.0985 2.14909 11.9015 2.17772 11.7766C2.21584 11.6103 2.28394 11.5025 2.42012 11.2868C3.54553 9.50484 6.8954 5 12.0004 5C17.1054 5 20.4553 9.50484 21.5807 11.2868C21.7169 11.5025 21.785 11.6103 21.8231 11.7766C21.8517 11.9015 21.8517 12.0985 21.8231 12.2234C21.785 12.3897 21.7169 12.4975 21.5807 12.7132C20.4553 14.4952 17.1054 19 12.0004 19C6.8954 19 3.54553 14.4952 2.42012 12.7132Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12.0004 15C13.6573 15 15.0004 13.6569 15.0004 12C15.0004 10.3431 13.6573 9 12.0004 9C10.3435 9 9.0004 10.3431 9.0004 12C9.0004 13.6569 10.3435 15 12.0004 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>{partner.displayName} will be able to view the selected wallet's activity and balances.</div>
        </Notice>
      </WalletsContainer>,
    ];
  }, [isCreatingWallet, newWallet, partner, wallets, recoverySecret, isRecoverySecretSaved]);

  useEffect(() => {
    // Situation where user has wallets, but none of the supported type (EVM/SOLANA)
    if (wallets.length === 0) {
      onCreateWallet();
    }
  }, [wallets]);

  return (
    <Root>
      <Container>
        <LayoutWithHero hero={header} state={newWallet ? 'success' : 'loading'}>
          <FlexColumn key={key} {...contentMotionProps}>
            <Heading>
              <span>{heading}</span>
            </Heading>
            <FlexColumn>{content}</FlexColumn>
          </FlexColumn>
        </LayoutWithHero>
      </Container>
    </Root>
  );
};

const Root = styled.div`
  height: 100vh;
  width: 456px;
  max-width: 100vw;
  background-color: white;
`;

const FlexColumn = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
`;

const WalletsContainer = styled(FlexColumn)`
  flex: 1;
  position: relative;
  bottom: 0;
`;

const Divider = styled(CpslDivider)`
  --divider-color: #d6d6d6;
  --cpsl-color-text-subtle: #ababab;
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
`;

const Wallets = styled(FlexColumn)`
  margin-top: 8px;
  position: relative;
  overflow-y: auto;
  max-height: calc(100vh - 370px);
  width: 100%;
`;

const Container = styled(FlexColumn)`
  padding-left: 12px;
  padding-right: 12px;
`;

const Heading = styled(CpslText)`
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
`;

const Subheading = styled(CpslText)<{ isDark?: boolean }>`
  line-height: auto;
  text-align: center;
  color: #868686;
`;

const Notice = styled.div`
  background-color: var(--cpsl-color-foreground-96);
  color: var(--cpsl-color-foreground-8);
  border-radius: 16px;
  display: flex;
  padding: 16px;
  gap: 12px;
  font-size: 12px;

  & > svg {
    flex-shrink: 0;
  }
`;

const ButtonRoot = styled.button`
  padding: 24px;
  background-color: white;
  border-radius: 16px;
  border: 1px solid;
  width: 100%;
  border-color: #adadad;
  cursor: pointer;
  font-family: 'Inter', sans-serif;

  &:hover {
    background-color: #f5f5f5;
  }

  &:active {
    background-color: #cacaca;
  }

  &:disabled {
    background-color: white;
    border-color: #d6d6d6;
  }
`;

// const ButtonRoot = styled(CpslButton)`
//   --button-padding-top: 16px;
//   --button-padding-left: 16px;
//   --button-padding-right: 16px;
//   --button-padding-bottom: 16px;
//   --button-box-shadow: none;
//   --cpsl-color-secondary-button-surface-default: #fff;
//   --cpsl-color-secondary-button-border-default: #d6d6d6;
//   --cpsl-color-secondary-button-surface-hover: #efefef;
//   --cpsl-color-secondary-button-surface-pressed: #cacaca;
//   --cpsl-color-secondary-button-surface-disabled: #fff;
//   --cpsl-color-secondary-button-border-disabled: #d6d6d6;
//   width: 100%;
// `;

const WalletButtonRoot = styled(ButtonRoot)<{ isClaimable?: boolean }>`
  ${({ isClaimable }) =>
    isClaimable
      ? `
      border-color: transparent;
      background: linear-gradient(white, white) padding-box, ${GRADIENT} border-box;

      &:hover {
        background: linear-gradient(#f5f5f5, #f5f5f5) padding-box, ${GRADIENT} border-box;
      }
    `
      : ''}
`;

const WalletButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const WalletButtonUpper = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  gap: 4px;
  align-items: center;
  justify-content: start;
`;

const WalletInfo = styled.div`
  display: flex;
  flex-grow: 1;
  align-items: baseline;
  gap: 4px;
  position: relative;
  top: 2px;
`;

const WalletName = styled.div`
  color: black;
  text-align: left;
  font-size: 20px;
  font-weight: 500;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 45%;
`;

const WalletAddress = styled.div`
  font-size: 14px;
  color: #858585;
`;

const WalletTag = styled.div`
  border-radius: 4px;
  color: #141414;
  border: 1px solid #d6d6d6;
  padding: 2px 4px;
  font-size: 10px;
  position: absolute;
  right: 0;
  bottom: 5px;
  line-height: 1;
`;

const WalletClaimable = styled(WalletTag)`
  color: white;
  border: 1px solid transparent;
  background: ${GRADIENT};
`;

const WalletButtonLower = styled(WalletButtonUpper)`
  font-size: 12px;
  gap: 0px;

  & > div {
    display: flex;
    align-items: center;
    color: #858585;
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
  border: 1px solid #d6d6d6;
  border-radius: 16px;
`;

const RecoverySecretInstructions = styled.div`
  font-size: 14px;
  color: #858585;
  text-align: center;

  & span {
    font-weight: bold;
    color: var(--cpsl-color-utility-red);
  }
`;
