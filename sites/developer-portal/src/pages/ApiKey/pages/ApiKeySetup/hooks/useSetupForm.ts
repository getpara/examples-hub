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
import { Framework } from '../../../../../types/framework';
import { PackageManager } from '../../../../../types/packageManager';

export type SetupForm = Pick<UpdateApiKeyFormData, 'cosmosPrefix'> &
  Pick<UpdateProjectBody, 'framework' | 'packageManager'> & {
    apiKey: string;
    secretApiKey: string;
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
  secretApiKey: z.string(),
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
    secretApiKey: apiKeyData?.secretApiKey ?? '',
    supportedWalletTypes: apiKeyData?.supportedWalletTypes ?? [],
    ...project,
    name: project?.name ?? '',
    framework: project?.framework ?? Framework.REACT,
    packageManager: project?.packageManager ?? PackageManager.YARN,
  };

  const onSubmit = async (
    {
      supportedWalletTypes,
      cosmosPrefix,
      framework,
      packageManager,
      name,
    }: Pick<SetupForm, 'supportedWalletTypes' | 'cosmosPrefix' | 'framework' | 'packageManager' | 'name'>,
    { projectId, apiKey, env }: SubmitVars,
  ) => {
    await updateKey({
      projectId,
      keyId: apiKey,
      env,
      data: { supportedWalletTypes, cosmosPrefix, displayName: name, name },
    });
    await updateProject({
      projectId,
      data: { framework, packageManager, name },
    });
  };

  const { form, submitForm } = useForm<SetupForm>({ formSchema, defaultValues: defaultData, onSubmit });

  return { form, submitForm };
};
