import { styled } from 'styled-components';
import { useStepTitle } from './hooks/useStepTitle.js';
import { CenteredText } from '../common.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useModalStore } from '../../stores/index.js';
import { BODY_MOTION_VARIANTS, BODY_TRANSITION } from '../../constants/constants.js';

export const Header = () => {
  const { title } = useStepTitle();
  const stepDirection = useModalStore(state => state.stepDirection);
  const currentStep = useModalStore(state => state.step);

  return (
    <AnimatePresence mode="popLayout" initial={false} custom={stepDirection}>
      <Container
        key={currentStep}
        custom={stepDirection}
        variants={BODY_MOTION_VARIANTS}
        initial="enter"
        animate="center"
        exit="exit"
        transition={BODY_TRANSITION}
        slot="header"
        id="header"
      >
        <CenteredText weight="semiBold" color="secondary">
          {title}
        </CenteredText>
      </Container>
    </AnimatePresence>
  );
};

const Container = styled(motion.div)`
  position: absolute;
  top: 16px;
  width: 100%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;
