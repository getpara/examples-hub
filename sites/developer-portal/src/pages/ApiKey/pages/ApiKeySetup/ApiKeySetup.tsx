import { Environment } from './components/Environment';
import { KeyData } from './components/KeyData';
import { ContentWrapper } from '../../components/ContentWrapper';
import { Networks } from './components/Networks';
import { Install } from './components/Install';
import { SideCard } from './components/SideCard';
import { useSetupForm } from './hooks/useSetupForm';
import { FormWrapper } from '../../components/FormWrapper';
import { Mobile } from './components/Mobile';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../hooks/api/queries/useOrganizationKeys';
import { Environment as TEnvironment } from '../../../../types/environment';

export const ApiKeySetup = () => {
  const { form, submitForm } = useSetupForm();
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as TEnvironment);

  const isOnboardingComplete = !!apiKeyData?.onboarding?.isComplete || !!apiKeyData?.onboarding?.isSkipped;

  return (
    <FormWrapper {...form} submitForm={submitForm}>
      <ContentWrapper
        columnOne={
          <>
            <KeyData />
            <Environment />
            <Networks />
            <Install />
            <Mobile />
          </>
        }
        columnTwo={!isOnboardingComplete ? <SideCard /> : undefined}
      />
    </FormWrapper>
  );
};
