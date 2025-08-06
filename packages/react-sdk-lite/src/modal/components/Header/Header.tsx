import { getAuthDisplay, safeStyled } from '@getpara/react-common';
import { useStepTitle } from './hooks/useStepTitle.js';
import { CenteredText } from '../common.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useModalStore } from '../../stores/index.js';
import { BODY_MOTION_VARIANTS, BODY_TRANSITION } from '../../constants/constants.js';
import { useAccount } from '../../../provider/index.js';
import { useInternalClient } from '../../../provider/hooks/utils/useInternalClient.js';
import { CpslIcon, CpslText } from '@getpara/react-components';
import { ModalStep } from '../../utils/steps.js';
import { useMemo } from 'react';

const StepTitle = () => {
  const para = useInternalClient();
  const currentStep = useModalStore(state => state.step);
  const { title, isTitleDisplayed } = useStepTitle();

  const { isConnected, connectionType } = useAccount();

  const content = useMemo(() => {
    if (!isTitleDisplayed) {
      return null;
    }

    if (para?.authInfo && connectionType !== 'external' && currentStep === ModalStep.ACCOUNT_MAIN) {
      const { name, icon, src } = getAuthDisplay(para.authInfo);

      return (
        <AuthDisplay>
          <CpslIcon src={src} icon={icon} size="14px" rounded={!!src} />
          <CpslText variant="bodyXS" color="contrast" weight="medium">
            {name}
          </CpslText>
        </AuthDisplay>
      );
    }

    return (
      <CenteredText weight="semiBold" color="secondary">
        {title}
      </CenteredText>
    );
  }, [isTitleDisplayed, para, currentStep, isConnected, connectionType, title]);

  return <div style={{ height: '100%', width: '100%' }}>{content}</div>;
};

export const Header = () => {
  const { isControls } = useStepTitle();
  const stepDirection = useModalStore(state => state.stepDirection);
  const currentStep = useModalStore(state => state.step);

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={stepDirection}>
      <Container
        isVisible={!isControls}
        key={['ADD_FUNDS_BUY', 'ADD_FUNDS_RECEIVE', 'ADD_FUNDS_WITHDRAW'].includes(currentStep) ? 'ADD_FUNDS' : currentStep}
        custom={stepDirection}
        variants={BODY_MOTION_VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        transition={BODY_TRANSITION}
        slot="header"
        id="header"
      >
        <StepTitle />
      </Container>
    </AnimatePresence>
  );
};

const Container = safeStyled(motion.div)<{ isVisible?: boolean }>`
  margin: 0 16px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  height: 24px;
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;

const AuthDisplay = safeStyled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;

  cpsl-icon {
    --icon-color: var(--cpsl-color-text-contrast);
  }
`;
