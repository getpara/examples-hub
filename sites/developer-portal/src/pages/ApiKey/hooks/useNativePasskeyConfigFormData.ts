import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdateNativePasskey = Pick<
  UpdateApiKeyFormData,
  'teamId' | 'bundleIdentifier' | 'androidPackageName' | 'androidSha256CertFingerprints'
>;

export const useNativePasskeyConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateNativePasskey>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      teamId: apiKeyData?.teamId ?? '',
      bundleIdentifier: apiKeyData?.bundleIdentifier ?? '',
      androidPackageName: apiKeyData?.androidPackageName ?? '',
      androidSha256CertFingerprints: apiKeyData?.androidSha256CertFingerprints?.join(',\n') ?? '',
    },
  });

  return form;
};
