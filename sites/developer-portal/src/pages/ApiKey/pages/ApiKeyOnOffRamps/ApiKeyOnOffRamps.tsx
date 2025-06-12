import { ContentWrapper } from '../../components/ContentWrapper';
import { useOnOffRampsForm } from './hooks/useOnOffRampsForm';
import { Receive } from './components/Receive';
import { Withdraw } from './components/Withdraw';
import { Buy } from './components/Buy';
import { FormWrapper } from '../../components/FormWrapper';
import { Providers } from './components/Providers';

export const ApiKeyOnOffRamps = () => {
  const { form, submitForm } = useOnOffRampsForm();

  return (
    <FormWrapper {...form} submitForm={submitForm}>
      <ContentWrapper
        columnOne={
          <>
            <Providers />
            <Buy />
            <Receive />
            <Withdraw />
          </>
        }
      />
    </FormWrapper>
  );
};
