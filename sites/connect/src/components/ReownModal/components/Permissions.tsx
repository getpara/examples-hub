import { Check, X } from 'lucide-react';
import { Section } from './Section';
import { cn, Typography } from '@getpara/react-component-library';

const PERMISSIONS = [
  {
    Icon: Check,
    text: 'View your balance and activity',
    granted: true,
  },
  {
    Icon: Check,
    text: 'Send approval requests',
    granted: true,
  },
  {
    Icon: X,
    text: 'Move funds without permission',
    granted: false,
  },
];

export const Permissions = () => {
  return (
    <Section label="Requested permissions">
      {PERMISSIONS.map(({ Icon, text, granted }, index) => (
        <div key={index} className="para:flex para:gap-2 para:items-center">
          <Icon
            className={cn('para:size-4', {
              'para:stroke-green-600': granted,
              'para:stroke-destructive': !granted,
            })}
          />
          <Typography color="secondary" className="para:text-sm para:font-semibold">
            {text}
          </Typography>
        </div>
      ))}
    </Section>
  );
};
