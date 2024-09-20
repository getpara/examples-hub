import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';

export type UpdateApiKeyOnRampConfig<T extends keyof UpdateApiKeyBody> = Pick<UpdateApiKeyBody, T>;

export const useOnRampConfigFlowsFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyOnRampConfig<'isBuyEnabled' | 'isWithdrawEnabled' | 'isReceiveEnabled'>>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      isBuyEnabled: apiKeyData?.isBuyEnabled ?? false,
      isWithdrawEnabled: apiKeyData?.isWithdrawEnabled ?? false,
      isReceiveEnabled: apiKeyData?.isReceiveEnabled ?? false,
    },
  });

  return form;
};

export const useOnRampConfigProvidersFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyOnRampConfig<'onRampProviders' | 'rampApiKey'>>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      onRampProviders: apiKeyData?.onRampProviders ?? [],
      rampApiKey: apiKeyData?.rampApiKey,
    },
  });

  return form;
};

export const useOnRampConfigAssetsFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyOnRampConfig<'onRampAssets'>>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      onRampAssets: apiKeyData?.onRampAssets,
    },
  });

  return form;
};
