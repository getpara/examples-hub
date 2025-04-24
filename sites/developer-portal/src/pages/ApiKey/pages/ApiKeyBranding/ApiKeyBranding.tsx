import { Form } from '@getpara/react-component-library';
import { ContentWrapper } from '../../components/ContentWrapper';
import { useBrandingForm } from './hooks/useBrandingForm';
import { ModalStyleAlert } from './components/ModalStyleAlert';
import { Logos } from './components/Logos';
import { Theme } from './components/Theme';
import { Font } from './components/Font';
import { Emails } from './components/Emails';
import { Links } from './components/Links';

export const ApiKeyBranding = () => {
  const { form, submitForm } = useBrandingForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitForm)}>
        <ContentWrapper>
          <ModalStyleAlert />
          <Logos />
          <Theme />
          <Font />
          <Emails />
          <Links />
        </ContentWrapper>
      </form>
    </Form>
  );
};
