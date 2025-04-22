import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdatePopup = Pick<UpdateApiKeyFormData, 'forceTransactionPopups'>;

export const usePopupConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdatePopup>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      forceTransactionPopups: apiKeyData?.forceTransactionPopups ?? false,
    },
  });

  return form;
};
