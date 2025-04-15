import { ConfigurationCard } from '../ConfigurationCard';
import { useGetOrganizationSubscriptionPlan } from '../../../../hooks/api/queries/useOrganizationSubscription';
import { HighlightedCard } from '../../../../components/HighlightedCard/HighlightedCard';
import { GradientCTAButton } from '../../../../components/GradientCTAButton/GradientCTAButton';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider, useWatch } from 'react-hook-form';
import { useNativePasskeyConfigFormData } from '../../hooks/useNativePasskeyConfigFormData';
import { ConfigurationActions } from '../ConfigurationActions';
import { TeamId } from './TeamId.tsx';
import { BundleIdentifier } from './BundleIdentifier';
import { getFrameworkNativePasskeyDocsLink } from '../../../../utils/framework.ts';
import { useGetProject } from '../../../../hooks/api/queries/useProjects.ts';
import { Framework } from '../../../../types/framework.ts';
import { InnerConfigurationCard } from '../InnerConfigurationCard.tsx';
import { AndroidPackageName } from './AndroidPackageName.tsx';
import { AndroidSha256CertFingerprints } from './AndroidSha256CertFingerprints.tsx';
import { CpslText, CpslCard } from '@getpara/react-components';
import styled from 'styled-components';
import { useApplePasskeyVerification } from '../../../../hooks/api/queries/useApplePasskeyVerification';
import { useGetOrganizationKey } from '../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../types/environment';

const TITLE = 'Native Passkey Configuration';

type VerificationStatus = 'PENDING' | 'APPROVED';

const StatusContainer = styled(CpslCard)<{ $hasMessage: boolean }>`
  width: 100%;
  min-height: ${({ $hasMessage }) => ($hasMessage ? '100px' : 'auto')};
  margin: 8px 0;
  --card-padding-top: ${({ $hasMessage }) => ($hasMessage ? '24px' : '16px')};
  --card-padding-bottom: ${({ $hasMessage }) => ($hasMessage ? '24px' : '16px')};
  --card-padding-start: 24px;
  --card-padding-end: 24px;
  --card-border-radius: 16px;
  --card-border-color: #d6d6d6;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusText = styled(CpslText)<{ status: VerificationStatus }>`
  color: ${({ status }) => (status === 'APPROVED' ? 'var(--cpsl-color-utility-green)' : 'var(--cpsl-color-utility-yellow)')};
  font-weight: 500;
`;

const StatusMessage = styled(CpslText)`
  margin-top: 8px;
  color: var(--cpsl-color-text-secondary);
`;

export const NativePasskeyConfiguration = () => {
  const { projectId, organizationId, apiKey, env } = useParams();
  const form = useNativePasskeyConfigFormData();
  const navigate = useNavigate();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: project } = useGetProject(projectId ?? '');
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const teamId = useWatch({ control: form.control, name: 'teamId' });
  const bundleIdentifier = useWatch({ control: form.control, name: 'bundleIdentifier' });

  // Only show status if we already have saved values or the form has been successfully submitted
  const shouldShowStatus =
    (Boolean(apiKeyData?.teamId) && Boolean(apiKeyData?.bundleIdentifier)) ||
    (form.formState.isSubmitted && Boolean(teamId && bundleIdentifier));

  // Only make the API call when shouldShowStatus is true
  const { data: isVerifiedByApple } = useApplePasskeyVerification({
    enabled: shouldShowStatus,
  });

  const handleUpgradeClick = () => {
    navigate(`/${organizationId}/billing`);
  };

  if (!plan?.canUseNativePasskeys) {
    return (
      <HighlightedCard title={TITLE}>
        <GradientCTAButton size="small" onClick={handleUpgradeClick}>
          Upgrade
        </GradientCTAButton>
      </HighlightedCard>
    );
  }

  const verificationStatus: VerificationStatus = isVerifiedByApple ? 'APPROVED' : 'PENDING';
  const statusText = isVerifiedByApple ? 'Approved by Apple' : 'Pending Verification by Apple';

  const renderVerificationStatus = () => {
    if (!shouldShowStatus) return null;
    return (
      <StatusContainer $hasMessage={Boolean(isVerifiedByApple)}>
        <StatusRow>
          <CpslText as="span">Status: </CpslText>
          <StatusText as="span" status={verificationStatus}>
            {statusText}
          </StatusText>
        </StatusRow>
        {isVerifiedByApple && <StatusMessage size="small">You may need to re-install the app.</StatusMessage>}
      </StatusContainer>
    );
  };

  return (
    <ConfigurationCard
      title={TITLE}
      docsLink={getFrameworkNativePasskeyDocsLink((project?.framework as Framework) ?? Framework.REACT_NATIVE)}
    >
      <FormProvider {...form}>
        <InnerConfigurationCard wideGap>
          <CpslText weight="semiBold">iOS</CpslText>
          {renderVerificationStatus()}
          <TeamId />
          <BundleIdentifier />
        </InnerConfigurationCard>
        <InnerConfigurationCard wideGap>
          <CpslText weight="semiBold">Android</CpslText>
          <AndroidPackageName />
          <AndroidSha256CertFingerprints />
        </InnerConfigurationCard>
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
