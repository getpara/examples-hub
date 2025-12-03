import { StepContainer } from '../../common.js';
import { useMemo, useRef, useEffect, useState } from 'react';
import { AccountSendForm } from './AccountSendForm.js';
import { AccountSendProvider, SendStep, useSend } from './context.js';
import { AccountSendAsset } from './AccountSendAsset.js';
import { AccountSendNetwork } from './AccountSendNetwork.js';
import { AnimatePresence, motion } from 'framer-motion';
import { BODY_MOTION_VARIANTS, BODY_TRANSITION, safeStyled } from '@getpara/react-common';
import { WalletSelectOld } from '../../WalletSelectOld/WalletSelectOld.js';
import { AccountSendNoAssets } from './AccountSendNoAssets.js';

const STEP_ORDER: SendStep[] = ['SEND_FORM', 'SEND_ASSET', 'SEND_NETWORK'];

function AccountSendIndex() {
  const { step, optionsType } = useSend();
  const prevStepRef = useRef<SendStep>(step);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const prevIndex = STEP_ORDER.indexOf(prevStepRef.current);
    const currentIndex = STEP_ORDER.indexOf(step);
    setDirection(currentIndex > prevIndex ? 1 : -1);
    prevStepRef.current = step;
  }, [step]);

  const Content = useMemo(() => {
    if (optionsType === 'NONE') {
      return <AccountSendNoAssets />;
    }

    switch (step) {
      case 'SEND_FORM':
        return <AccountSendForm />;
      case 'SEND_ASSET':
        return <AccountSendAsset />;
      case 'SEND_NETWORK':
        return <AccountSendNetwork />;
    }
  }, [step, optionsType]);

  return (
    <StepContainer style={{ gap: '16px' }}>
      {step === 'SEND_FORM' && (
        <WalletSelectOld noTitle types={['EVM', 'SOLANA']} isEmbeddedOnly style={{ width: '100%' }} />
      )}
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <AnimatedContainer
          key={step}
          custom={direction}
          variants={BODY_MOTION_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={BODY_TRANSITION}
        >
          {Content}
        </AnimatedContainer>
      </AnimatePresence>
    </StepContainer>
  );
}

const AnimatedContainer = safeStyled(motion.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export function AccountSend({ step }: { step: SendStep }) {
  return (
    <AccountSendProvider step={step}>
      <AccountSendIndex />
    </AccountSendProvider>
  );
}
