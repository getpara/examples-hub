import { MutationOptions, useMutation } from '@tanstack/react-query';
import { createCustomerPortalSession, CreateCustomerPortalSessionVars } from '../../../api/organizations/mutations';
import { CreateCustomerPortalSessionResponse } from '../../../types/api';
import { useParams } from 'react-router-dom';

export const useCreatePortalSession = (
  options?: MutationOptions<
    CreateCustomerPortalSessionResponse,
    Error,
    Omit<CreateCustomerPortalSessionVars, 'organizationId' | 'successUrl'>,
    unknown
  >,
) => {
  const { organizationId } = useParams();

  return useMutation<
    CreateCustomerPortalSessionResponse,
    Error,
    Omit<CreateCustomerPortalSessionVars, 'organizationId' | 'successUrl'>,
    unknown
  >({
    mutationFn: vars =>
      createCustomerPortalSession({ ...vars, successUrl: location.href, organizationId: organizationId ?? '' }),
    ...options,
  });
};
