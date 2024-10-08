import { MutationOptions, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/app/useAppStore';
import { createCheckoutSession, CreateCheckoutSessionVars } from '../../../api/organizations/mutations';
import { CreateCheckoutSessionResponse } from '../../../types/api';

export const useCreateCheckoutSession = (
  options?: MutationOptions<
    CreateCheckoutSessionResponse,
    Error,
    {
      orgIdOverride?: string;
      successUrlOverride?: string;
    } & Omit<CreateCheckoutSessionVars, 'organizationId' | 'successUrl'>,
    unknown
  >,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<
    CreateCheckoutSessionResponse,
    Error,
    {
      orgIdOverride?: string;
      successUrlOverride?: string;
    } & Omit<CreateCheckoutSessionVars, 'organizationId' | 'successUrl'>,
    unknown
  >({
    mutationFn: vars =>
      createCheckoutSession({
        ...vars,
        successUrl: vars.successUrlOverride ?? location.href,
        organizationId: vars.orgIdOverride ?? organizationId ?? '',
      }),
    ...options,
  });
};
