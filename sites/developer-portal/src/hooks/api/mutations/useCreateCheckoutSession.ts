import { MutationOptions, useMutation } from '@tanstack/react-query';
import { createCheckoutSession, CreateCheckoutSessionVars } from '../../../api/organizations/mutations';
import { CreateCheckoutSessionResponse } from '../../../types/api';
import { useParams } from 'react-router-dom';

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
  const { organizationId } = useParams();

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
