import { useState } from 'react';
import { useCreateCheckoutSession } from './api/mutations/useCreateCheckoutSession';
import { useCreatePortalSession } from './api/mutations/useCreatePortalSession';
import { useHasStripeSubscription } from './api/queries/useOrganizationSubscription';
import { CustomerPortalFlow } from '../api/organizations/mutations';
import { toast } from '@getpara/react-component-library';

export const useStripePlan = () => {
  const { mutateAsync: createCheckoutSession } = useCreateCheckoutSession();
  const { mutateAsync: createPortalSession } = useCreatePortalSession();
  const {
    data: hasSubscription,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError,
  } = useHasStripeSubscription();

  const [isCreatingStripeSession, setIsCreatingStripeSession] = useState(false);

  const createCustomerPortalSession = async ({ flow, planSlug }: { flow?: CustomerPortalFlow; planSlug?: string }) => {
    if (!hasSubscription) {
      return;
    }

    setIsCreatingStripeSession(true);
    await createPortalSession(
      { flow, planSlug },
      {
        onSuccess: data => {
          if (data.sessionUrl) {
            window.location.assign(data.sessionUrl);
          } else {
            toast.error('Failed to Create Stripe Customer Portal', {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          }
        },
        onError: () => {
          toast.error('Failed to Create Stripe Customer Portal', {
            description: 'Please try again. If the problem persists, contact Para support.',
          });
        },
        onSettled: () => {
          setIsCreatingStripeSession(false);
        },
      },
    );
  };

  const createSubscription = async (planSlug: string, orgIdOverride?: string, successUrlOverride?: string) => {
    if (isSubscriptionLoading || isSubscriptionError) {
      return;
    }

    if (hasSubscription) {
      return;
    }

    setIsCreatingStripeSession(true);
    await createCheckoutSession(
      { planSlug, orgIdOverride, successUrlOverride },
      {
        onSuccess: data => {
          if (data.sessionUrl) {
            window.location.assign(data.sessionUrl);
          } else {
            toast.error('Failed to Create Stripe Checkout', {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          }
        },
        onError: () => {
          toast.error('Failed to Create Stripe Checkout', {
            description: 'Please try again. If the problem persists, contact Para support.',
          });
        },
        onSettled: () => {
          setIsCreatingStripeSession(false);
        },
      },
    );
  };

  return { isCreatingStripeSession, createSubscription, createCustomerPortalSession };
};
