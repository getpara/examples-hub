import { PREGEN_DOCS_LINK } from '../../../../utils/constants';
import { ConfigurationCard } from '../ConfigurationCard';
import { usePopupConfigFormData } from '../../hooks/usePopupConfigFormData';
import { FormProvider } from 'react-hook-form';
import { Popup } from './Popup';
import { ConfigurationActions } from '../ConfigurationActions';

const TITLE = 'Show Pop-ups to Users for Transactions';
const SUBTITLE = 'Control if you want users to manually confirm transactions via a pop-up window.';

export const PopupConfiguration = () => {
  const form = usePopupConfigFormData();

  return (
    <ConfigurationCard
      title={TITLE}
      subtitle={SUBTITLE}
      docsLink={PREGEN_DOCS_LINK}
      disableCollapse
      buttonVariant="learnMore"
    >
      <FormProvider {...form}>
        <Popup />
        <ConfigurationActions />
      </FormProvider>
    </ConfigurationCard>
  );
};
