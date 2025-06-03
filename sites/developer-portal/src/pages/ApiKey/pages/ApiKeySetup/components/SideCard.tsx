import { useParams } from 'react-router-dom';
import { FlatCard } from '../../../../../components/FlatCard';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { SetupGuide } from './SetupGuide';
import { Environment } from '../../../../../types/environment';

export const SideCard = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const isOnboardingComplete = !!apiKeyData?.onboarding?.isComplete || !!apiKeyData?.onboarding?.isSkipped;

  if (isOnboardingComplete) {
    return null;
  }

  return (
    <div>
      <FlatCard className="para:p-6 para:xl:w-[352px] para-h-full para:gap-4">
        <SetupGuide />
      </FlatCard>
    </div>
  );
};
