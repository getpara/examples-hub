import { cn, Typography } from '@getpara/react-component-library';
import { useApplePasskeyVerification } from '../../../../../hooks/api/queries/useApplePasskeyVerification';
import { FlatCard } from '../../../../../components/common';

type VerificationStatusProps = {
  platform: 'apple' | 'android';
};

export const VerificationStatus = ({ platform }: VerificationStatusProps) => {
  const isApple = platform === 'apple';
  const isGoogle = platform === 'android';

  const { data: appleVerified } = useApplePasskeyVerification({ enabled: isApple });
  const { data: androidVerified } = useApplePasskeyVerification({ enabled: isGoogle });

  const isVerified = isApple ? appleVerified : androidVerified;

  const statusText = isVerified
    ? `Approved by ${isApple ? 'Apple' : 'Google'}`
    : `Pending Verification by ${isApple ? 'Apple' : 'Google'}`;

  return (
    <FlatCard className="para:p-4 para:gap-1">
      <Typography className="para:font-medium">
        Status:{' '}
        <Typography
          className={cn('para:inline', {
            'para:text-green-600': isVerified,
            'para:text-amber-500': !isVerified,
          })}
        >
          {statusText}
        </Typography>
      </Typography>
      <Typography className="para:text-sm" color="muted">
        You may need to re-install the app.
      </Typography>
    </FlatCard>
  );
};
