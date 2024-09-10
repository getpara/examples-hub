import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';

export type UpdateApiKeyBranding = Pick<
  UpdateApiKeyBody,
  'foregroundColor' | 'backgroundColor' | 'font' | 'logoUrl' | 'iconUrl' | 'homepageUrl'
>;

export const useBrandingConfigFormData = () => {
  const { apiKey, env } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyBranding>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      homepageUrl: apiKeyData?.homepageUrl ?? '',
      foregroundColor: apiKeyData?.foregroundColor ?? '',
      backgroundColor: apiKeyData?.backgroundColor ?? '',
      font: apiKeyData?.font ?? '',
      logoUrl: apiKeyData?.logoUrl ?? '',
      iconUrl: apiKeyData?.iconUrl ?? '',
    },
  });

  return form;
};
