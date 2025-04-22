import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdateApiKeyPortal = Pick<UpdateApiKeyFormData, 'verifyUrl' | 'origins'>;

export const usePortalConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyPortal>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      origins: apiKeyData?.origins?.join(',\n') ?? '',
      verifyUrl: apiKeyData?.verifyUrl ?? '',
    },
  });

  return form;
};
