import { ConfigurationCard } from '../ConfigurationCard';
import { useGetOrganizationSubscriptionPlan } from '../../../../hooks/api/queries/useOrganizationSubscription';
import { HighlightedCard } from '../../../../components/HighlightedCard/HighlightedCard';
import { GradientCTAButton } from '../../../../components/GradientCTAButton/GradientCTAButton';
import { useNavigate, useParams } from 'react-router-dom';
import { FormProvider } from 'react-hook-form';
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
import { CpslText } from '@getpara/react-components';

const TITLE = 'Native Passkey Configuration';

export const NativePasskeyConfiguration = () => {
  const { projectId, organizationId } = useParams();
  const form = useNativePasskeyConfigFormData();
  const navigate = useNavigate();
  const { data: plan } = useGetOrganizationSubscriptionPlan();
  const { data: project } = useGetProject(projectId ?? '');

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

  return (
    <ConfigurationCard
      title={TITLE}
      docsLink={getFrameworkNativePasskeyDocsLink((project?.framework as Framework) ?? Framework.REACT_NATIVE)}
    >
      <FormProvider {...form}>
        <InnerConfigurationCard wideGap>
          <CpslText weight="semiBold">IOS</CpslText>
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
