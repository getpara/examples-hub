import { MutationOptions, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/app/useAppStore';
import { createCustomerPortalSession, CreateCustomerPortalSessionVars } from '../../../api/organizations/mutations';
import { CreateCustomerPortalSessionResponse } from '../../../types/api';

export const useCreatePortalSession = (
  options?: MutationOptions<
    CreateCustomerPortalSessionResponse,
    Error,
    Omit<CreateCustomerPortalSessionVars, 'organizationId' | 'successUrl'>,
    unknown
  >,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

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
