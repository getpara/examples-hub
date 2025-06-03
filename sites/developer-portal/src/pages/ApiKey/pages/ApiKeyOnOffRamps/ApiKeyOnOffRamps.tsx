import { ContentWrapper } from '../../components/ContentWrapper';
import { useOnOffRampsForm } from './hooks/useOnOffRampsForm';
import { Receive } from './components/Receive';
import { Withdraw } from './components/Withdraw';
import { Buy } from './components/Buy';
import { FormWrapper } from '../../components/FormWrapper';

export const ApiKeyOnOffRamps = () => {
  const { form, submitForm } = useOnOffRampsForm();

  return (
    <FormWrapper {...form} submitForm={submitForm}>
      <ContentWrapper
        columnOne={
          <>
            <Buy />
            <Receive />
            <Withdraw />
          </>
        }
      />
    </FormWrapper>
  );
};
