import { useParams } from 'react-router-dom';
import { FlatCard } from '../../../components/FlatCard';
import { X } from 'lucide-react';
import { NotificationType, useAppStore } from '../../../stores/app/useAppStore';
import { PropsWithChildren, useState } from 'react';
import { motion } from 'framer-motion';

type DismissibleCTAWrapperProps = {
  type: NotificationType;
} & PropsWithChildren;

export const DismissibleCTAWrapper = ({ type, children }: DismissibleCTAWrapperProps) => {
  const { organizationId } = useParams();
  const hasDismissed = useAppStore(state => state.hasDismissedOnboardingNotification(organizationId ?? '', type));
  const dismissOnboardingNotification = useAppStore(state => state.dismissOnboardingNotification);
  const [isVisible, setIsVisible] = useState(!hasDismissed);

  if (hasDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <motion.div
      initial={false}
      animate={isVisible ? { height: 'auto' } : { height: 0 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={() => {
        dismissOnboardingNotification(organizationId ?? '', type);
      }}
      className="para:overflow-hidden"
    >
      <FlatCard className="para:relative para:pt-[26px] para:pl-8 para:pr-4 para:pb-[30px]">
        <X
          className="para:size-4 para:absolute para:right-4 para:top-4 para:opacity-[70%] para:cursor-pointer"
          onClick={handleDismiss}
        />
        {children}
      </FlatCard>
    </motion.div>
  );
};
