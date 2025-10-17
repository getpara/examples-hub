import { ContentWrapper } from '../../components/ContentWrapper';
import { useSecurityForm } from './hooks/useSecurityForm';
/* TODO(REST API): Re-enable once Allowed IP management ships. */
// import { AllowedIpAddresses } from './components/AllowedIpAddresses';
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
            {/* TODO(REST API): Re-enable once Allowed IP management ships.
            <AllowedIpAddresses />
            */}
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
