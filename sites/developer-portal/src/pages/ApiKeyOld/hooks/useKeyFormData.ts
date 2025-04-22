import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdateApiKeyData = UpdateApiKeyFormData;

export const useKeyDataForm = () => {
  const { projectId, apiKey, env } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateApiKeyData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      homepageUrl: apiKeyData?.homepageUrl ?? '',
      foregroundColor: apiKeyData?.foregroundColor ?? '',
      backgroundColor: apiKeyData?.backgroundColor ?? '',
      font: apiKeyData?.font ?? '',
      logoUrl: apiKeyData?.logoUrl ?? '',
      twitterUrl: apiKeyData?.twitterUrl ?? '',
      linkedinUrl: apiKeyData?.linkedinUrl ?? '',
      githubUrl: apiKeyData?.githubUrl ?? '',
      emailImageLink: apiKeyData?.emailImageLink ?? '',
      emailWelcome: apiKeyData?.emailWelcome,
      emailBackupKit: apiKeyData?.emailBackupKit,
      portalUrl: apiKeyData?.portalUrl ?? '',
      verifyUrl: apiKeyData?.verifyUrl ?? '',
    },
  });

  return form;
};
