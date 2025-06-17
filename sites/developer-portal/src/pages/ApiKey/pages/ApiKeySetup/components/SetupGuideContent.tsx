import { Link, useParams } from 'react-router-dom';
import { useGetApiKeySetupStatus } from '../../../../../hooks/api/queries/useApiKeySetupStatus';
import { Android, Button, IOS, SlottedInput, Typography, useFormContext } from '@getpara/react-component-library';
import { OnboardingStep } from '../config';
import { Check } from 'lucide-react';
import { formatPhoneNumber } from '@getpara/react-sdk';
import { VerificationStatus } from './VerificationStatus';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { getIsFrameworkAndroid, getIsFrameworkIos } from '../../../../../utils/framework';
import { SetupForm } from '../hooks/useSetupForm';
import { Framework } from '../../../../../types/framework';

type SetupGuideContentProps = {
  step: OnboardingStep;
};

export const SetupGuideContent = ({ step }: SetupGuideContentProps) => {
  const form = useFormContext<SetupForm>();
  const { organizationId, apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const framework = form.watch('framework');

  const { androidPackageName, androidSha256CertFingerprints, teamId, bundleIdentifier } = apiKeyData ?? {};

  // Only show status if we have saved values
  const isAppleConfigured = !!teamId && !!bundleIdentifier;
  const isAndroidConfigured = !!androidPackageName && !!androidSha256CertFingerprints;
  const isIosFramework = getIsFrameworkIos(framework as Framework);
  const isAndroidFramework = getIsFrameworkAndroid(framework as Framework);

  if (step.showUser) {
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

  const primaryTo = step.primaryButton?.isExternal
    ? step.primaryButton.to
    : `/${organizationId}/project/${projectId}/key/${env}/${apiKey}${step.primaryButton?.to}`;
  const secondaryTo = step.secondaryButton?.isExternal
    ? step.secondaryButton.to
    : `/${organizationId}/project/${projectId}/key/${env}/${apiKey}${step.secondaryButton?.to}`;

  return (
    <div className="para:flex para:flex-col para:gap-4">
      {step.showMobileStatus && (
        <>
          {isIosFramework && (
            <>
              <div className="para:flex para:items-center para:gap-2">
                <IOS className="para:size-4" />
                <Typography className="para:text-sm para:font-medium para:leading-none">iOS</Typography>
              </div>
              <VerificationStatus platform="apple" isConfigured={isAppleConfigured} isSmall />
            </>
          )}
          {isAndroidFramework && (
            <>
              <div className="para:flex para:items-center para:gap-2">
                <Android className="para:size-4" />
                <Typography className="para:text-sm para:font-medium para:leading-none">Android</Typography>
              </div>
              <VerificationStatus platform="android" isConfigured={isAndroidConfigured} isSmall />
            </>
          )}
        </>
      )}
      <div className="para:flex para:gap-4 para:items-center">
        {step.primaryButton && (
          <Link to={primaryTo} target={step.primaryButton.target}>
            <Button size="sm" variant="neutral">
              {step.primaryButton.Icon && <step.primaryButton.Icon className="para:size-4" />}
              {step.primaryButton.text}
            </Button>
          </Link>
        )}
        {step.secondaryButton && (
          <Link to={secondaryTo} target={step.secondaryButton.target}>
            <Button size="sm" variant="ghost">
              {step.secondaryButton.Icon && <step.secondaryButton.Icon className="para:size-4" />}
              {step.secondaryButton.text}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
