import { Environment } from './components/Environment';
import { KeyData } from './components/KeyData';
import { ContentWrapper } from '../../components/ContentWrapper';
import { Networks } from './components/Networks';
import { Install } from './components/Install';
import { SideCard } from './components/SideCard';
import { useSetupForm } from './hooks/useSetupForm';
import { FormWrapper } from '../../components/FormWrapper';
import { Mobile } from './components/Mobile';

export const ApiKeySetup = () => {
  const { form, submitForm } = useSetupForm();

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
        columnTwo={<SideCard />}
      />
    </FormWrapper>
  );
};
