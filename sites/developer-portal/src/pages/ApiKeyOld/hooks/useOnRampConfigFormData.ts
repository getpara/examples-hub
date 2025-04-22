import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdateApiKeyOnRampConfig<T extends keyof UpdateApiKeyFormData> = Pick<UpdateApiKeyFormData, T>;

export const useOnRampConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<
    UpdateApiKeyOnRampConfig<
      'onRampProviders' | 'rampApiKey' | 'onRampAssets' | 'defaultOnRampAsset' | 'defaultOnRampNetwork' | 'defaultBuyAmount'
    >
  >({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      onRampProviders: apiKeyData?.onRampProviders ?? [],
      rampApiKey: apiKeyData?.rampApiKey,
      onRampAssets: apiKeyData?.onRampAssets,
      defaultOnRampAsset: apiKeyData?.defaultOnRampAsset,
      defaultOnRampNetwork: apiKeyData?.defaultOnRampNetwork,
      defaultBuyAmount: apiKeyData?.defaultBuyAmount,
    },
  });

  return form;
};

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
