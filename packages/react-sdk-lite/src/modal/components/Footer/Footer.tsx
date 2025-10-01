import { safeStyled } from '@getpara/react-common';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { PARA_TERMS_AND_CONDITIONS } from '../../constants/constants.js';
import { useModalStore } from '../../stores/index.js';
import { ModalStep } from '../../utils/steps.js';
import { useAccountLinking } from '../../../provider/providers/AccountLinkProvider.js';

export const Footer = () => {
  const currentStep = useModalStore(state => state.step);
  const { accountLinkInProgress } = useAccountLinking();

  const showFooter =
    !accountLinkInProgress &&
    [
      ModalStep.AUTH_MAIN,
      ModalStep.AUTH_MORE,
      ModalStep.EX_WALLET_NETWORK_SELECT,
      ModalStep.EX_WALLET_MORE,
      ModalStep.EX_WALLET_SELECTED,
    ].includes(currentStep);

  if (!showFooter) {
    return null;
  }

  return (
    <FooterContainer>
      <InlineText variant="body2XS" color="secondary" weight="medium">
        By logging in you agree to our{' '}
        <a href={PARA_TERMS_AND_CONDITIONS} target="blank">
          <ClickableText variant="body2XS" weight="medium">
            Terms & Conditions
          </ClickableText>
        </a>
      </InlineText>
      <PoweredByContainer>
        <ParaLogo icon="para" />
      </PoweredByContainer>
    </FooterContainer>
  );
};

const FooterContainer = safeStyled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
`;

const PoweredByContainer = safeStyled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
`;

const InlineText = safeStyled(CpslText)`
  text-align: center;
  display: inline-block;
`;

const ClickableText = safeStyled(InlineText)`
  cursor: pointer;
  display: inline-block;

  &:hover {
    text-decoration: underline;}
`;

const ParaLogo = safeStyled(CpslIcon)`
  display: inline-block;
  --icon-color: var(--cpsl-color-text-contrast);
  --width: 46px;
  --height: auto;
`;
