import { useParams } from 'react-router-dom';
import { useGetProject } from '../../../../../hooks/api/queries/useProjects';
import { useGetOrganizationKey } from '../../../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../../../types/environment';
import { UpdateApiKeyFormData, UpdateProjectBody } from '../../../../../types/api';
import { SupportedWalletTypes, WALLET_TYPES } from '@getpara/react-sdk';
import { z } from 'zod';
import { SchemaFromInterface } from '../../../../../types/helpers';
import { useUpdateApiKey } from '../../../../../hooks/api/mutations/useUpdateApiKey';
import { useUpdateProject } from '../../../../../hooks/api/mutations/useUpdateProject';
import { SubmitVars, useForm } from '../../../hooks/useForm';

export type SetupForm = Pick<UpdateApiKeyFormData, 'cosmosPrefix'> &
  Pick<UpdateProjectBody, 'framework' | 'packageManager'> & {
    apiKey: string;
    name: string;
    supportedWalletTypes: SupportedWalletTypes;
  };

const formSchema = z.object({
  cosmosPrefix: z.string().optional().nullable(),
  supportedWalletTypes: z.array(z.object({ type: z.enum(WALLET_TYPES), optional: z.boolean().optional() })).min(1),
  name: z.string(),
  framework: z.string().optional().nullable(),
  packageManager: z.string().optional().nullable(),
  apiKey: z.string(),
}) satisfies SchemaFromInterface<SetupForm>;

export const useSetupForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: project } = useGetProject(projectId ?? '');
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const { mutateAsync: updateProject } = useUpdateProject();

  const defaultData: SetupForm = {
    ...apiKeyData,
    apiKey: apiKeyData?.apiKey ?? '',
    supportedWalletTypes: apiKeyData?.supportedWalletTypes ?? [],
    ...project,
    name: project?.name ?? '',
  };

  const onSubmit = async (
    {
      supportedWalletTypes,
      cosmosPrefix,
      framework,
      packageManager,
    }: Pick<SetupForm, 'supportedWalletTypes' | 'cosmosPrefix' | 'framework' | 'packageManager'>,
    { projectId, apiKey, env }: SubmitVars,
  ) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: { supportedWalletTypes, cosmosPrefix },
    });
    await updateProject({
      projectId,
      data: { framework, packageManager },
    });
  };

  const { form, submitForm } = useForm<SetupForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
