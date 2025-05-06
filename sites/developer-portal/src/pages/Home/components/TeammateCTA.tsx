import { ArrowRight } from 'lucide-react';
import { FlatCard } from '../../../components/common';
import { Typography } from '@getpara/react-component-library';

export const TeammateCTA = () => {
  return (
    <FlatCard className="para:pt-[26px] para:px-8 para:pb-[30px]">
      <div className="para:flex para:items-center para:gap-2 para:justify-between para:w-full para:h-full">
        <div>
          <Typography className="para:text-xl para:font-semibold">Invite a teammate</Typography>
          <Typography color="muted" className="para:text-sm para:font-medium">
            Add teammates to help manage your Para instance.
          </Typography>
        </div>
        <ArrowRight />
      </div>
    </FlatCard>
  );
};
