import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdateApiKeyEmail = Pick<
  UpdateApiKeyFormData,
  'twitterUrl' | 'linkedinUrl' | 'githubUrl' | 'emailImageLink' | 'emailWelcome' | 'emailBackupKit'
>;

export const useEmailConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyEmail>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      twitterUrl: apiKeyData?.twitterUrl ?? '',
      linkedinUrl: apiKeyData?.linkedinUrl ?? '',
      githubUrl: apiKeyData?.githubUrl ?? '',
      emailImageLink: apiKeyData?.emailImageLink ?? '',
      emailWelcome: apiKeyData?.emailWelcome,
      emailBackupKit: apiKeyData?.emailBackupKit,
    },
  });

  return form;
};
