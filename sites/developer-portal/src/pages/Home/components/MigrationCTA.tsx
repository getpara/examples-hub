import { Link, useParams } from 'react-router-dom';
import { FlatCard } from '../../../components/common';
import { Button, Typography } from '@getpara/react-component-library';
import { CALENDLY_LINK } from '../../../utils/constants';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { X } from 'lucide-react';
import { useAppStore } from '../../../stores/app/useAppStore';
import { useState } from 'react';
import { motion } from 'framer-motion';

export const MigrationCTA = () => {
  const { organizationId } = useParams();
  const { data: org } = useGetSelectedOrganization();
  const hasDismissed = useAppStore(state => state.hasDismissedNotification(organizationId ?? '', 'providerMigration'));
  const dismissNotification = useAppStore(state => state.dismissNotification);
  const [isVisible, setIsVisible] = useState(!hasDismissed);

  const hasCurrentProvider = (org?.onboardingAnswersRaw as any)?.currentProvider === 'No';

  if (!hasCurrentProvider || hasDismissed) {
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
        dismissNotification(organizationId ?? '', 'providerMigration');
      }}
      className="para:overflow-hidden"
    >
      <FlatCard className="para:relative para:pt-[26px] para:pl-8 para:pr-4 para:pb-[30px]">
        <X
          className="para:size-4 para:absolute para:right-4 para:top-4 para:opacity-[70%] para:cursor-pointer"
          onClick={handleDismiss}
        />
        <div className="para:flex para:items-end para:gap-2 para:justify-between para:w-full para:h-full">
          <div>
            <Typography className="para:text-xl para:font-semibold">Schedule a migration call</Typography>
            <Typography color="muted" className="para:text-sm para:font-medium">
              Learn about migrating your app and existing users to Para.
            </Typography>
          </div>
          <Link to={CALENDLY_LINK} target="_blank">
            <Button variant="neutral">Schedule a Call</Button>
          </Link>
        </div>
      </FlatCard>
    </motion.div>
  );
};
