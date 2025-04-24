import { Form } from '@getpara/react-component-library';
import { ContentWrapper } from '../../components/ContentWrapper';
import { useOnOffRampsForm } from './hooks/useOnOffRampsForm';
import { Receive } from './components/Receive';
import { Withdraw } from './components/Withdraw';
import { Buy } from './components/Buy';

export const ApiKeyOnOffRamps = () => {
  const { form, submitForm } = useOnOffRampsForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <ContentWrapper>
          <Buy />
          <Receive />
          <Withdraw />
        </ContentWrapper>
      </form>
    </Form>
  );
};
