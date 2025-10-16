import { safeStyled, useCopyToClipboard, WalletSelect } from '@getpara/react-common';
import { FlexStartInnerContainer, usePara } from '../../../components';
import { CpslAlert, CpslButton, CpslCard, CpslIcon, CpslText } from '@getpara/react-components';
import { AvailableWallet, truncateAddress, TWalletType } from '@getpara/web-sdk';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useModalOutletContext } from '../../../hooks/useModalOutletContext';

export const PrivateKey = ({ value, walletId }: { value: string; walletId: string }) => {
  const para = usePara();
  const { isDark } = useModalOutletContext();
  const [isCopied, copy] = useCopyToClipboard();

  const availableViews = useMemo(() => {
    const wallet = para.wallets[walletId];

    const availableViews = [
      ...(para.supportedWalletTypes.some(({ type }) => type === 'EVM') ? [{ ...wallet, type: 'EVM' as TWalletType }] : []),
      ...(para.supportedWalletTypes.some(({ type }) => type === 'COSMOS')
        ? [{ ...wallet, type: 'COSMOS' as TWalletType }]
        : []),
    ];
    return availableViews;
  }, [walletId, para.wallets, para.supportedWalletTypes]);

  const [view, setView] = useState<AvailableWallet | null>(availableViews[0] ?? null);
  const [isObscured, setIsObscured] = useState(true);

  return (
    <Container>
      <Title variant="bodyL" color="contrast">
        Export Private Key
      </Title>
      <CpslAlert variant="warning" icon="alertTriangle" filled style={{ width: '100%' }}>
        Be careful! Your private key gives anyone access to your wallet and there is no way to recover lost funds. Do not
        share it with anyone.
      </CpslAlert>
      <Section>
        <CpslText variant="bodyS" color="contrast" style={{ width: '100%' }}>
          Wallet
        </CpslText>
        <Select
          style={{ width: '100%' }}
          isDark={isDark}
          value={view}
          onChange={setView}
          options={availableViews}
          getEntryProps={({ id, type }) => {
            const address = para.getDisplayAddress(id, { addressType: type });
            return {
              name: truncateAddress(address, type, { targetLength: availableViews.length > 1 ? 24 : 28 }),
              type,
              withCopy: true,
              withIcon: true,
              copyValue: address,
            };
          }}
          getSelectValue={({ id, type }) => `${id}~${type}`}
        />
      </Section>
      <Section>
        <CpslText variant="bodyS" color="contrast" style={{ width: '100%' }}>
          Private Key
        </CpslText>
        <PrivateKeyContainer>
          {value}
          <CopyButtonContainer>
            <CopyButton
              id="ignore-click"
              size="small"
              variant="ghost"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                copy(value);
              }}
            >
              <CpslIcon id="ignore-click" slot="start" icon={isCopied ? 'check' : 'copy'} />
            </CopyButton>
          </CopyButtonContainer>
          <AnimatePresence>
            {isObscured && (
              <Overlay
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                onClick={() => setIsObscured(false)}
              >
                Click to reveal
              </Overlay>
            )}
          </AnimatePresence>
        </PrivateKeyContainer>
      </Section>
    </Container>
  );
};

const Container = safeStyled(FlexStartInnerContainer)`
`;

const Title = safeStyled(CpslText)`
  width: 100%;
  text-align: center;
`;

const Section = safeStyled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  width: 100%;
`;

const PrivateKeyContainer = safeStyled(CpslCard)`
  width: 100%;
  position: relative;
  color: var(--cpsl-color-text-contrast);
  white-space: normal;
  word-break: break-all;
  text-overflow: break-all;
  font-weight: 300;

  --card-padding-top: 8px;
  --card-padding-start: 12px;
  --card-padding-bottom: 8px;
  --card-padding-end: 36px;

  --card-background-color: var(--cpsl-color-background-8);
  --cpsl-border-radius-card: 12px;
`;

const Select = safeStyled(WalletSelect)`
  &::part(select-container) {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &::part(icon) {
    position: absolute;
    right: 12px;
  }
`;

const Overlay = safeStyled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  cursor: pointer;
  font-size: 16px;
  color: var(--cpsl-color-text-contrast);
  border-radius: 12px;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 2; 
`;

const CopyButton = safeStyled(CpslButton)`
  cpsl-icon {
    --height: 24px;
    --width: 24px;
  }
`;

const CopyButtonContainer = safeStyled.div`
  position: absolute;
  right: 0px;
  top: 0px;
  bottom: 0px;
  padding: 8px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
`;
