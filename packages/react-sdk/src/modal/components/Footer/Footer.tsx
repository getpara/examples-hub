import { safeStyled } from '@getpara/react-common';
import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import { useModalStore } from '../../stores/index.js';
import { PARA_CONNECT, PARA_TERMS_AND_CONDITIONS } from '../../constants/constants.js';
import { useMemo } from 'react';
import { getStepHasFooter } from '../../utils/steps.js';
import { useAccount } from '../../../provider/index.js';

export const Footer = () => {
  const { data: account } = useAccount();
  const currentStep = useModalStore(state => state.step);

  const accountFooter = account?.isConnected && !account.isGuestMode;
  const showFooter = accountFooter || getStepHasFooter(currentStep);

  const Content = useMemo(() => {
    if (accountFooter) {
      return (
        <ConnectContainer>
          <ConnectText variant="bodyS" color="secondary" weight="medium">
            Access all your wallet’s features at{' '}
            <a href={PARA_CONNECT} target="blank">
              <ClickableText variant="bodyS" weight="medium">
                Para Connect
              </ClickableText>
            </a>
          </ConnectText>
          <CpslButton as="a" href={PARA_CONNECT} target="blank" variant="ghost">
            <RightChevron icon="chevronUp" />
          </CpslButton>
        </ConnectContainer>
      );
    }

    return (
      <>
        <InlineText variant="body2XS" color="secondary" weight="medium">
          By logging in you agree to our{' '}
          <a href={PARA_TERMS_AND_CONDITIONS} target="blank">
            <ClickableText variant="body2XS" weight="medium">
              Terms & Conditions
            </ClickableText>
          </a>
        </InlineText>
        <PoweredByContainer>
          <InlineText variant="bodyS" color="secondary" weight="medium">
            Powered by
          </InlineText>
          <ParaLogo icon="para" />
        </PoweredByContainer>
      </>
    );
  }, [account]);

  if (!showFooter) {
    return null;
  }

  return (
    <FooterContainer slot="footer">
      <FooterContentContainer>{Content}</FooterContentContainer>
    </FooterContainer>
  );
};

const FooterContainer = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0px;
`;

const FooterContentContainer = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const PoweredByContainer = safeStyled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const ConnectContainer = safeStyled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const RightChevron = safeStyled(CpslIcon)`
  transform: rotate(90deg);

  /* --icon-color: var(--cpsl-color-text-tertiary); */
  --height: 24px;
  --width: 24px;
`;

const InlineText = safeStyled(CpslText)`
  text-align: center;
  display: inline-block;
`;

const ConnectText = safeStyled(InlineText)`
  line-height: 20px;
`;

const ClickableText = safeStyled(InlineText)`
  cursor: pointer;
  display: inline-block;
`;

const ParaLogo = safeStyled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-secondary);
  --width: 49px;
  --height: auto;
`;
