import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData } from '../../../../../types/api';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { SubmitVars, useForm } from '../../../hooks/useForm';
import { Network, OnRampAsset, OnRampProvider } from '@getpara/react-sdk';

export type OnOffRampsForm = Pick<
  UpdateApiKeyFormData,
  | 'isBuyEnabled'
  | 'isReceiveEnabled'
  | 'isWithdrawEnabled'
  | 'onRampProviders'
  | 'rampApiKey'
  | 'onRampAssets'
  | 'defaultBuyAmount'
  | 'defaultOnRampAsset'
  | 'defaultOnRampNetwork'
>;

const formSchema = z.object({
  isBuyEnabled: z.boolean().optional().nullable(),
  isReceiveEnabled: z.boolean().optional().nullable(),
  isWithdrawEnabled: z.boolean().optional().nullable(),
  onRampProviders: z.array(z.nativeEnum(OnRampProvider)).optional().nullable(),
  rampApiKey: z.string().optional().nullable(),
  onRampAssets: z
    .record(z.nativeEnum(Network), z.union([z.literal(true), z.array(z.nativeEnum(OnRampAsset))]))
    .optional()
    .nullable(),
  defaultBuyAmount: z.union([
    z
      .string()
      .transform(val => val.replace(/[^0-9.-]+/g, ''))
      .pipe(
        z
          .number({ coerce: true })
          .min(0.0001, 'Amount cannot be less than $0.0001')
          .max(999_999, 'Amount cannot exceed $999,999.00'),
      )
      .transform(String),
    z.string().length(0),
  ]),
  defaultOnRampNetwork: z.nativeEnum(Network).optional().nullable(),
  defaultOnRampAsset: z.nativeEnum(OnRampAsset).optional().nullable(),
}) satisfies SchemaFromInterface<OnOffRampsForm>;

export const useOnOffRampsForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { mutateAsync: updateKey } = useUpdateApiKey();

  const defaultData: OnOffRampsForm = {
    ...apiKeyData,
    rampApiKey: apiKeyData?.rampApiKey ?? '',
    defaultBuyAmount: apiKeyData?.defaultBuyAmount ?? '',
  };

  const onSubmit = async (updateData: OnOffRampsForm, { projectId, apiKey, env }: SubmitVars) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: updateData,
    });
  };

  const { form, submitForm } = useForm<OnOffRampsForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
