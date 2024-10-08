import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';

export type UpdatePopup = Pick<UpdateApiKeyBody, 'transactionPopupsEnabled'>;

export const usePopupConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdatePopup>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      transactionPopupsEnabled: apiKeyData?.transactionPopupsEnabled ?? false,
    },
  });

  return form;
};
