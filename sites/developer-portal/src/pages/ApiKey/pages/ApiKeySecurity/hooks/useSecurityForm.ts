import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData } from '../../../../../types/api';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { AUTH_METHODS } from '../../../../../utils/constants';
import { SubmitVars, useForm } from '../../../hooks/useForm';

export type SecurityForm = Pick<
  UpdateApiKeyFormData,
  'origins' | 'supportedAuthMethods' | 'sessionMaxAge' | 'forceTransactionPopups'
>;

const formSchema = z.object({
  origins: z
    .string()
    .refine(
      v =>
        v === '' ||
        v
          .split(',')
          .map(v => v.trim())
          .every(item => z.string().url().safeParse(item).success),
      { message: 'Invalid origin string, values must be valid urls' },
    )
    .optional()
    .nullable(),
  supportedAuthMethods: z
    .array(z.string())
    .refine(val => val.every(method => AUTH_METHODS.map(m => m.value).includes(method)), {
      message: 'Invalid authentication method',
    })
    .refine(val => !(val.includes('PIN') && val.includes('PASSWORD')), {
      message: 'PIN and password cannot be selected at the same time',
    })
    .optional()
    .nullable(),
  sessionMaxAge: z
    .number()
    .min(5, 'Sessions must be longer than or equal to 5 minutes')
    .max(43_200, 'Sessions must be shorter than or equal to 30 days')
    .optional()
    .nullable(),
  forceTransactionPopups: z.boolean().optional().nullable(),
}) satisfies SchemaFromInterface<SecurityForm>;

export const useSecurityForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { mutateAsync: updateKey } = useUpdateApiKey();

  const defaultData = {
    ...apiKeyData,
    origins: apiKeyData?.origins?.join(', ') ?? '',
    // convert from ms to minutes
    sessionMaxAge: apiKeyData?.sessionMaxAge ? parseInt(apiKeyData.sessionMaxAge) / (60 * 1000) : null,
  };

  const onSubmit = async (updateData: SecurityForm, { projectId, apiKey, env }: SubmitVars) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: {
        ...updateData,
        ...(updateData.origins ? { origins: updateData.origins.split(',').map(v => v.trim()) } : { origins: null }),
        ...(updateData.sessionMaxAge
          ? { sessionMaxAge: (updateData.sessionMaxAge * 60 * 1000).toString(10) } // convert minutes to ms
          : { sessionMaxAge: null }),
      },
    });
  };

  const { form, submitForm } = useForm<SecurityForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
