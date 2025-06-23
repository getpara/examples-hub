import { cn, Typography } from '@getpara/react-component-library';
import { useApplePasskeyVerification } from '../../../../../hooks/api/queries/useApplePasskeyVerification';
import { FlatCard } from '../../../../../components/FlatCard';

type VerificationStatusProps = {
  platform: 'apple' | 'android';
  isConfigured?: boolean;
  isSmall?: boolean;
};

export const VerificationStatus = ({ platform, isConfigured, isSmall }: VerificationStatusProps) => {
  const isApple = platform === 'apple';
  const isGoogle = platform === 'android';

  const { data: appleVerified } = useApplePasskeyVerification({ enabled: isApple });
  const { data: androidVerified } = useApplePasskeyVerification({ enabled: isGoogle });

  const isVerified = isApple ? appleVerified : androidVerified;

  const statusText = !isConfigured
    ? 'Not Configured'
    : isVerified
      ? `Approved by ${isApple ? 'Apple' : 'Google'}`
      : `Pending Verification by ${isApple ? 'Apple' : 'Google'}`;

  return (
    <FlatCard className="para:p-4 para:lg:p-4 para:gap-1">
      <Typography
        className={cn('para:font-medium para:leading-none', {
          'para:text-sm': isSmall,
        })}
      >
        Status:{' '}
        <Typography
          className={cn('para:inline', {
            'para:text-green-600': isVerified,
            'para:text-amber-500': !isVerified,
            'para:text-muted-foreground': !isConfigured,
          })}
        >
          {statusText}
        </Typography>
      </Typography>
      {isVerified && (
        <Typography
          className={cn('para:text-sm', {
            'para:text-xs': isSmall,
          })}
          color="muted"
        >
          You may need to re-install the app.
        </Typography>
      )}
    </FlatCard>
  );
};
