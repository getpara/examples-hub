import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { ThemeMode, UpdateApiKeyBody } from '../../../types/api';

export type UpdateApiKeyBranding = Pick<
  UpdateApiKeyBody,
  'foregroundColor' | 'backgroundColor' | 'font' | 'logoUrl' | 'iconUrl' | 'homepageUrl' | 'accentColor' | 'themeMode'
>;

export const useBrandingConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyBranding>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      homepageUrl: apiKeyData?.homepageUrl ?? '',
      foregroundColor: apiKeyData?.foregroundColor ?? '',
      backgroundColor: apiKeyData?.backgroundColor ?? '',
      accentColor: apiKeyData?.accentColor ?? '',
      themeMode: apiKeyData?.themeMode ?? ThemeMode.LIGHT,
      font: apiKeyData?.font ?? '',
      logoUrl: apiKeyData?.logoUrl ?? '',
      iconUrl: apiKeyData?.iconUrl ?? '',
    },
  });

  return form;
};
