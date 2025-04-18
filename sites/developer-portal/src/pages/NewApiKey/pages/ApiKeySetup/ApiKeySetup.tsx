import { Environment } from './components/Environment';
import { KeyData } from './components/KeyData';
import { Header } from '../../components/Header';
import { Form } from '@getpara/react-component-library';
import { useSetupForm } from '../../hooks/useSetupForm';
import { ContentWrapper } from '../../components/ContentWrapper';
import { Networks } from './components/Networks';
import { Install } from './components/Install';
import { SideCard } from './components/SideCard';

export const ApiKeySetup = () => {
  const { form, onSubmit } = useSetupForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ContentWrapper>
          <Header />
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
