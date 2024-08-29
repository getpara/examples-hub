import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';

export type UpdateApiKeyPortal = Pick<UpdateApiKeyBody, 'portalUrl' | 'verifyUrl'>;

export const usePortalConfigFormData = () => {
  const { apiKey, env } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyPortal>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      portalUrl: apiKeyData?.portalUrl ?? '',
      verifyUrl: apiKeyData?.verifyUrl ?? '',
    },
  });

  return form;
};
