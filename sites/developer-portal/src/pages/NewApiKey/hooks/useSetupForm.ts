import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetProject } from '../../../hooks/api/queries/useProjects';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData, UpdateProjectBody } from '../../../types/api';
import { WALLET_TYPES } from '@getpara/react-sdk';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { SchemaFromInterface } from '../../../types/helpers';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { useUpdateProject } from '../../../hooks/api/mutations/useUpdateProject';
import { triggerToast } from '../../../utils/toasts';

export type SetupForm = Pick<UpdateApiKeyFormData, 'supportedWalletTypes' | 'cosmosPrefix'> &
  Pick<UpdateProjectBody, 'name' | 'framework' | 'packageManager'> & { apiKey: string };

const formSchema = z.object({
  cosmosPrefix: z.string(),
  supportedWalletTypes: z.array(z.object({ type: z.enum(WALLET_TYPES), optional: z.boolean() })).min(1),
  name: z.string(),
  framework: z.string(),
  packageManager: z.string(),
  apiKey: z.string(),
}) satisfies SchemaFromInterface<SetupForm>;

export const useSetupForm = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: project } = useGetProject(projectId ?? '');
  const { mutateAsync: updateKey } = useUpdateApiKey();
  const { mutateAsync: updateProject } = useUpdateProject();

  const form = useForm<SetupForm>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: apiKeyData?.apiKey,
      supportedWalletTypes: apiKeyData?.supportedWalletTypes,
      cosmosPrefix: apiKeyData?.cosmosPrefix,
      name: project?.name,
      framework: project?.framework,
      packageManager: project?.packageManager,
    },
    disabled: !apiKeyData || !project || apiKeyData.archived || project.archived,
  });

  const onSubmit = async ({ supportedWalletTypes, cosmosPrefix, framework, packageManager }: SetupForm) => {
    if (projectId && apiKey && env) {
      try {
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
