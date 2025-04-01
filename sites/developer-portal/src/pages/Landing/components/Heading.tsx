import { Typography } from '@getpara/react-component-library';

export const Heading = () => {
  return (
    <div className="para:flex para:flex-col para:gap-2">
      <Typography className="para:text-[40px] para:text-center para:font-semibold para:text-foreground">
        Para Developer Portal
      </Typography>
      <Typography className="para:text-center para:font-medium para:text-sm para:text-muted-foreground">
        Customize, manage, and see analytics for your Para instance.
      </Typography>
    </div>
  );
};
