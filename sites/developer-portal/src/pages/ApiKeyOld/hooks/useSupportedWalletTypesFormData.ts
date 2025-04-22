import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';

export type UpdateApiKeyOnRampConfig<T extends keyof UpdateApiKeyBody> = Pick<UpdateApiKeyBody, T>;

export const useSupportedWalletTypesFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyOnRampConfig<'supportedWalletTypes' | 'cosmosPrefix'>>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      supportedWalletTypes: apiKeyData?.supportedWalletTypes ?? [{ type: 'EVM', optional: false }],
      cosmosPrefix: apiKeyData?.cosmosPrefix ?? 'cosmos',
    },
  });

  return form;
};
