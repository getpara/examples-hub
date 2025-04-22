import { Label, RadioGroupItem, Typography } from '@getpara/react-component-library';

type EmailRadioGroupItemProps = {
  value: string;
  label: string;
  subLabel: string;
};

export const EmailRadioGroupItem = ({ value, label, subLabel }: EmailRadioGroupItemProps) => {
  return (
    <div className="para:flex para:gap-2 para:items-start">
      <RadioGroupItem value={value} id={`${value}-radio`} />
      <Label htmlFor={`${value}-radio`} className="para:flex para:flex-col para:gap-1.5 para:items-start">
        <Typography className="para:text-sm para:font-medium para:leading-none">{label}</Typography>
        <Typography color="muted" className="para:text-sm para:font-normal">
          {subLabel}
        </Typography>
      </Label>
    </div>
  );
};
