import { useState } from 'react';
import { triggerToast } from '../utils/toasts';
import { useCreateCheckoutSession } from './api/mutations/useCreateCheckoutSession';
import { useCreatePortalSession } from './api/mutations/useCreatePortalSession';
import { useHasStripeSubscription } from './api/queries/useOrganizationSubscription';
import { CustomerPortalFlow } from '../api/organizations/mutations';

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
            triggerToast({
              variant: 'error',
              title: 'Failed to Create Stripe Customer Portal',
              body: 'Please try again. If the problem persists, contact Capsule support.',
            });
          }
        },
        onError: () => {
          setIsCreatingStripeSession(false);
          triggerToast({
            variant: 'error',
            title: 'Failed to Create Stripe Customer Portal',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
  };

  const changePlan = async (planSlug: string) => {
    if (isSubscriptionLoading || isSubscriptionError) {
      return;
    }

    setIsCreatingStripeSession(true);
    if (!hasSubscription) {
      await createCheckoutSession(
        { planSlug },
        {
          onSuccess: data => {
            if (data.sessionUrl) {
              window.location.assign(data.sessionUrl);
            } else {
              setIsCreatingStripeSession(false);
              triggerToast({
                variant: 'error',
                title: 'Failed to Create Stripe Checkout',
                body: 'Please try again. If the problem persists, contact Capsule support.',
              });
            }
          },
          onError: () => {
            setIsCreatingStripeSession(false);
            triggerToast({
              variant: 'error',
              title: 'Failed to Create Stripe Checkout',
              body: 'Please try again. If the problem persists, contact Capsule support.',
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
