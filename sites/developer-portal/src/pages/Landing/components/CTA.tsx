import { ON_RAMP_DOCS_LINK } from '../../../utils/constants';
import { Button, StarsFilled, Typography } from '@getpara/react-component-library';
import { ChevronRight } from 'lucide-react';

export const CTA = () => {
  return (
    <a className="para:w-full" href={ON_RAMP_DOCS_LINK} target="_blank">
      <Button className="para:w-full para:h-[50px] para:rounded-[12px]">
        <div className="para:flex para:flex-1 para:justify-between para:items-center">
          <div className="para:flex para:items-center para:gap-1">
            <StarsFilled className="para:size-4" />
            <Typography className="para:text-sm para:font-semibold">Now with On and Off Ramps</Typography>
          </div>
          <div className="para:flex para:items-center para:gap-1">
            <Typography className="para:text-xs para:font-semibold">Learn More</Typography>
            <ChevronRight className="para:size-5" />
          </div>
        </div>
      </Button>
    </a>
  );
};
