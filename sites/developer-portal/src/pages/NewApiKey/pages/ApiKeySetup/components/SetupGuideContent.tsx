import { Link, useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../../../../hooks/api/queries/useApiKeySetupStatus';
import { Button, SlottedInput } from '@getpara/react-component-library';
import { OnboardingStep } from '../config';
import { Check } from 'lucide-react';
import { formatPhoneNumber } from '@getpara/react-sdk';

type SetupGuideContentProps = {
  stepNumber: number;
  step: OnboardingStep;
};

export const SetupGuideContent = ({ stepNumber, step }: SetupGuideContentProps) => {
  const { apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');

  if (stepNumber === 0) {
    const user = status?.firstUser?.user;
    let userValue: string | undefined;
    if (user) {
      const formattedPhone = user.phone ? formatPhoneNumber(user.phone.number, user.phone.countryCode) : undefined;

      userValue = user.email ?? formattedPhone ?? user.externalWallets?.[0]?.address ?? user.id;
    }

    return (
      <SlottedInput
        value={userValue}
        EndSlot={!!user ? <Check className="para:stroke-green-600 para:size-4" /> : undefined}
        placeholder="No user yet"
        disabled
        inputClassName="para:disabled:opacity-100"
      />
    );
  }

  return (
    <div className="para:flex para:gap-4 para:items-center">
      {step.primaryButton && (
        <Link to={step.primaryButton.to} target={step.primaryButton.target}>
          <Button size="sm" variant="neutral">
            {step.primaryButton.Icon && <step.primaryButton.Icon className="para:size-4" />}
            {step.primaryButton.text}
          </Button>
        </Link>
      )}
      {step.secondaryButton && (
        <Link to={step.secondaryButton.to} target={step.secondaryButton.target}>
          <Button size="sm" variant="ghost">
            {step.secondaryButton.Icon && <step.secondaryButton.Icon className="para:size-4" />}
            {step.secondaryButton.text}
          </Button>
        </Link>
      )}
    </div>
  );
};
