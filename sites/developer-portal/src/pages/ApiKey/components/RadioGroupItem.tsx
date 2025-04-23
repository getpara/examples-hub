import { Label, RadioGroupItem as BaseRadioGroupItem, Typography } from '@getpara/react-component-library';

type RadioGroupItemProps = {
  value: string;
  label: string;
  subLabel: string;
};

export const RadioGroupItem = ({ value, label, subLabel }: RadioGroupItemProps) => {
  return (
    <div className="para:flex para:gap-2 para:items-start">
      <BaseRadioGroupItem value={value} id={`${value}-radio`} />
      <Label htmlFor={`${value}-radio`} className="para:flex para:flex-col para:gap-1.5 para:items-start">
        <Typography className="para:text-sm para:font-medium para:leading-none">{label}</Typography>
        <Typography color="muted" className="para:text-sm para:font-normal">
          {subLabel}
        </Typography>
      </Label>
    </div>
  );
};
