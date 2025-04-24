import { Form } from '@getpara/react-component-library';
import { ContentWrapper } from '../../components/ContentWrapper';
import { useSecurityForm } from './hooks/useSecurityForm';
import { Origins } from './components/Origins';
import { AuthMethods } from './components/AuthMethods';
import { TransactionPopups } from './components/TransactionPopups';
import { SessionLength } from './components/SessionLength';

export const ApiKeySecurity = () => {
  const { form, submitForm } = useSecurityForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <ContentWrapper>
          <Origins />
          <AuthMethods />
          <TransactionPopups />
          {/* TODO: add 2fa control once 2fa is configured on the key */}
          {/* <TwoFactorAuth /> */}
          <SessionLength />
        </ContentWrapper>
      </form>
    </Form>
  );
};
