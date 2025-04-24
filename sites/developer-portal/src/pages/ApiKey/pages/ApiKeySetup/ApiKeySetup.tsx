import { Environment } from './components/Environment';
import { KeyData } from './components/KeyData';
import { Form } from '@getpara/react-component-library';
import { ContentWrapper } from '../../components/ContentWrapper';
import { Networks } from './components/Networks';
import { Install } from './components/Install';
import { SideCard } from './components/SideCard';
import { useSetupForm } from './hooks/useSetupForm';

export const ApiKeySetup = () => {
  const { form, submitForm } = useSetupForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <ContentWrapper>
          <div className="para:flex para:flex-col-reverse para:xl:flex-row para:gap-8">
            <ContentWrapper>
              <KeyData />
              <Environment />
              <Networks />
              <Install />
            </ContentWrapper>
            <SideCard />
          </div>
        </ContentWrapper>
      </form>
    </Form>
  );
};
