import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData } from '../../../../../types/api';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { triggerToast } from '../../../../../utils/toasts';
import { useIsValidKey, useIsValidProject } from '../../../../../hooks/useIsValidOrgConfig';
import { AUTH_METHODS } from '../../../../../utils/constants';

export type SecurityForm = Pick<
  UpdateApiKeyFormData,
  'origins' | 'supportedAuthMethods' | 'sessionMaxAge' | 'forceTransactionPopups'
>;

const formSchema = z.object({
  origins: z
    .string()
    .refine(
      v =>
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
    .optional()
    .nullable(),
  sessionMaxAge: z
    .number()
    .min(300000, 'Sessions must be longer than or equal to 5 minutes')
    .max(2_592_000_000, 'Sessions must be shorter than or equal to 30 days')
    .optional()
    .nullable(),
  forceTransactionPopups: z.boolean().optional().nullable(),
}) satisfies SchemaFromInterface<SecurityForm>;

export const useBrandingForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const isValidKey = useIsValidKey(projectId, apiKey);
  const isValidProject = useIsValidProject(projectId);
  const { mutateAsync: updateKey } = useUpdateApiKey();

  const form = useForm<SecurityForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...apiKeyData,
      origins: apiKeyData?.origins?.join(', '),
      sessionMaxAge: apiKeyData?.sessionMaxAge ? parseInt(apiKeyData.sessionMaxAge) : null,
    },
    disabled: !isValidKey || !isValidProject,
  });

  const onSubmit = async (updateData: SecurityForm) => {
    if (projectId && apiKey && env) {
      try {
        await updateKey({
          projectId,
          keyId: apiKey,
          env,
          data: {
            ...updateData,
            ...(updateData.origins ? { origins: updateData.origins.split(',').map(v => v.trim()) } : { origins: [] }),
            ...(updateData.sessionMaxAge
              ? { sessionMaxAge: updateData.sessionMaxAge.toString(10) }
              : { sessionMaxAge: null }),
          },
        });
        form.reset(form.getValues());
        triggerToast({
          variant: 'success',
          title: 'Config Saved!',
        });
      } catch (err) {
        triggerToast({
          variant: 'error',
          title: 'Failed to Save Config',
          body: 'Please correct any errors. If the problem persists, contact Para support.',
        });
      }
    }
  };

  return { form, onSubmit };
};
