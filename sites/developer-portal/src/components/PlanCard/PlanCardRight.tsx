import { PlanIncludes } from '../../types/planMetadata';
import { Typography } from '@getpara/react-component-library';
import { Check, X } from 'lucide-react';

type PlanCardRightProps = PlanIncludes;

export const PlanCardRight = ({ title, subtitle, includes, excludes, comingSoon }: PlanCardRightProps) => {
  return (
    <div className="para:flex para:flex-col para:flex-1 para:gap-2">
      <Typography className="para:text-sm para:font-semibold">{title}</Typography>
      {subtitle && (
        <Typography color="secondary" className="para:text-sm">
          {subtitle}
        </Typography>
      )}
      {includes?.map(item => (
        <div className="para:flex para:items-center para:gap-2" key={item}>
          <Check className="para:size-4 para:stroke-foreground" />
          <Typography color="secondary" className="para:text-sm">
            {item}
          </Typography>
        </div>
      ))}
      {!!excludes?.length &&
        excludes?.map(item => (
          <div className="para:flex para:items-center para:gap-2" key={item}>
            <X className="para:size-4 para:stroke-foreground" />
            <Typography color="secondary" className="para:text-sm">
              {item}
            </Typography>
          </div>
        ))}
      {!!comingSoon?.length && (
        <>
          <Typography color="primary" className="para:text-sm para:font-semibold">
            Coming Soon
          </Typography>
          {comingSoon.map(item => (
            <Typography key={item} color="secondary" className="para:text-sm">
              {item}
            </Typography>
          ))}
        </>
      )}
    </div>
  );
};
