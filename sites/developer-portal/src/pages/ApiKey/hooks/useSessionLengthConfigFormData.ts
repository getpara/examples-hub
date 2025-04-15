import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetOrganizationKey } from '../../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../../types/environment';
import { UpdateApiKeyFormData } from '../../../types/api';

export type UpdateSessionLength = Pick<UpdateApiKeyFormData, 'sessionMaxAge'>;

export const useSessionLengthConfigFormData = () => {
  const { apiKey, env, projectId } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);

  const form = useForm<UpdateSessionLength>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      sessionMaxAge: apiKeyData?.sessionMaxAge,
    },
  });

  return form;
};
