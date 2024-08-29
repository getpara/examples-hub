import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyBody } from '../../../types/api';

export type UpdateApiKeyEmail = Pick<
  UpdateApiKeyBody,
  'twitterUrl' | 'linkedinUrl' | 'githubUrl' | 'emailImageLinkUrl' | 'emailWelcome' | 'emailBackupKit'
>;

export const useEmailConfigFormData = () => {
  const { apiKey, env } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyEmail>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      twitterUrl: apiKeyData?.twitterUrl ?? '',
      linkedinUrl: apiKeyData?.linkedinUrl ?? '',
      githubUrl: apiKeyData?.githubUrl ?? '',
      emailImageLinkUrl: apiKeyData?.emailImageLinkUrl ?? '',
      emailWelcome: apiKeyData?.emailWelcome,
      emailBackupKit: apiKeyData?.emailBackupKit,
    },
  });

  return form;
};
