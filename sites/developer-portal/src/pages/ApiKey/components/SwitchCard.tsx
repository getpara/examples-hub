import { Switch, SwitchProps, Typography } from '@getpara/react-component-library';
import { FlatCard } from '../../../components/common';
import clsx from 'clsx';

type SwitchCardProps = {
  label: string;
} & SwitchProps;

export const SwitchCard = ({ label, checked, ...rest }: SwitchCardProps) => {
  return (
    <FlatCard className="para:p-4 para:flex para:flex-row para:justify-between para:items-center">
      <span>
        <Typography className="para:font-medium para:inline">{label}: </Typography>
        <Typography
          className={clsx('para:font-medium para:inline', {
            'para:text-destructive': !checked,
            'para:text-green-600': checked,
          })}
        >
          {checked ? 'On' : 'Off'}
        </Typography>
      </span>
      <Switch checked={checked} {...rest} />
    </FlatCard>
  );
};
