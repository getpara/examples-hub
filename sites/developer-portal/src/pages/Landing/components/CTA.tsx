import { ON_RAMP_DOCS_LINK } from '../../../utils/constants';
import { Button, StarsFilled, Typography } from '@getpara/react-component-library';
import { ChevronRight } from 'lucide-react';

// Leaving this component here for now in case we want to re-enable it later
export const CTA = () => {
  return null;

  return (
    <a className="para:w-full" href={ON_RAMP_DOCS_LINK} target="_blank">
      <Button className="para:w-full para:h-[50px] para:rounded-[12px]">
        <div className="para:flex para:flex-1 para:justify-between para:items-center">
          <div className="para:flex para:items-center para:gap-1">
            <StarsFilled className="para:size-4" />
            <Typography className="para:text-sm para:font-semibold para:text-primary-foreground">
              Now with On and Off Ramps
            </Typography>
          </div>
          <div className="para:flex para:items-center para:gap-1">
            <Typography className="para:text-xs para:font-semibold para:text-primary-foreground">Learn More</Typography>
            <ChevronRight className="para:size-5 para:stroke-primary-foreground" />
          </div>
        </div>
      </Button>
    </a>
  );
};
