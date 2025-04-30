import { ContentWrapper } from '../../components/ContentWrapper';
import { useBrandingForm } from './hooks/useBrandingForm';
import { ModalStyleAlert } from './components/ModalStyleAlert';
import { Logos } from './components/Logos';
import { Theme } from './components/Theme';
import { Font } from './components/Font';
import { Emails } from './components/Emails';
import { Links } from './components/Links';
import { FormWrapper } from '../../components/FormWrapper';

export const ApiKeyBranding = () => {
  const { form, submitForm } = useBrandingForm();

  return (
    <FormWrapper {...form} submitForm={submitForm}>
      <ContentWrapper>
        <ModalStyleAlert />
        <Logos />
        <Theme />
        <Font />
        <Emails />
        <Links />
      </ContentWrapper>
    </FormWrapper>
  );
};
