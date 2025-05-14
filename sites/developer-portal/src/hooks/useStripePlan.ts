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
            setIsCreatingStripeSession(false);
            toast.error('Failed to Create Stripe Customer Portal', {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          }
        },
        onError: () => {
          setIsCreatingStripeSession(false);
          toast.error('Failed to Create Stripe Customer Portal', {
            description: 'Please try again. If the problem persists, contact Para support.',
          });
        },
      },
    );
  };

  const changePlan = async (planSlug: string, orgIdOverride?: string, successUrlOverride?: string) => {
    if (isSubscriptionLoading || isSubscriptionError) {
      return;
    }

    setIsCreatingStripeSession(true);
    if (!hasSubscription) {
      await createCheckoutSession(
        { planSlug, orgIdOverride, successUrlOverride },
        {
          onSuccess: data => {
            if (data.sessionUrl) {
              window.location.assign(data.sessionUrl);
            } else {
              setIsCreatingStripeSession(false);
              toast.error('Failed to Create Stripe Checkout', {
                description: 'Please try again. If the problem persists, contact Para support.',
              });
            }
          },
          onError: () => {
            setIsCreatingStripeSession(false);
            toast.error('Failed to Create Stripe Checkout', {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    } else {
      await createCustomerPortalSession({ planSlug, flow: 'subscriptionUpdateConfirm' });
    }
  };

  return { isCreatingStripeSession, changePlan, createCustomerPortalSession };
};
