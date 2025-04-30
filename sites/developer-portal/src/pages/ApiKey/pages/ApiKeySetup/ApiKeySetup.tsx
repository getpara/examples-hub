import { Environment } from './components/Environment';
import { KeyData } from './components/KeyData';
import { ContentWrapper } from '../../components/ContentWrapper';
import { Networks } from './components/Networks';
import { Install } from './components/Install';
import { SideCard } from './components/SideCard';
import { useSetupForm } from './hooks/useSetupForm';
import { FormWrapper } from '../../components/FormWrapper';

export const ApiKeySetup = () => {
  const { form, submitForm } = useSetupForm();

  return (
    <FormWrapper {...form} submitForm={submitForm}>
      <ContentWrapper>
        <div className="para:flex para:flex-col-reverse para:xl:flex-row para:gap-8">
          <div className="para:flex para:flex-col para:gap-4 para:flex-1">
            <KeyData />
            <Environment />
            <Networks />
            <Install />
          </div>
          <SideCard />
        </div>
      </ContentWrapper>
    </FormWrapper>
  );
};
