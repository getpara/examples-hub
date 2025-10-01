import { ContentWrapper } from '../../components/ContentWrapper';
import { useSecurityForm } from './hooks/useSecurityForm';
// import { AllowedIpAddresses } from './components/AllowedIpAddresses'; // Hidden until REST API launch
import { Origins } from './components/Origins';
import { AuthMethods } from './components/AuthMethods';
import { TransactionPopups } from './components/TransactionPopups';
import { SessionLength } from './components/SessionLength';
import { FormWrapper } from '../../components/FormWrapper';

export const ApiKeySecurity = () => {
  const { form, submitForm } = useSecurityForm();

  return (
    <FormWrapper {...form} submitForm={submitForm}>
      <ContentWrapper
        columnOne={
          <>
            {/* <AllowedIpAddresses /> -- Hidden until REST API launch */}
            <Origins />
            <AuthMethods />
            <TransactionPopups />
            {/* TODO: add 2fa control once 2fa is configured on the key */}
            {/* <TwoFactorAuth /> */}
            <SessionLength />
          </>
        }
      />
    </FormWrapper>
  );
};
