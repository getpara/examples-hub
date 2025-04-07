import { ENTERPRISE_PLAN_SLUG, FREE_PLAN_SLUG, ZAPIER_WEBHOOK_URL } from '../../../utils/constants';
import { useCreateOrganization } from '../../../hooks/api/mutations/useCreateOrganization';
import { triggerToast } from '../../../utils/toasts';
import { useOnboardingStore } from '../../../stores/onboarding/useOnboardingStore';
import { useStripePlan } from '../../../hooks/useStripePlan';
import { useSetSelectedOrganizationWithNavigation } from '../../../hooks/useSetSelectedOrganizationWithNavigation';
import { useUploadOrganizationLogo } from '../../../hooks/api/mutations/useUploadOrganizationLogo';
import { useUpdateOrganization } from '../../../hooks/api/mutations/useUpdateOrganization';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import axios from 'axios';
import { useAccount } from '@getpara/react-sdk';

export const useSubmitOnboarding = () => {
  const { data: account } = useAccount();
  const userId = account?.isConnected ? account.userId : undefined;
  const email = account?.isConnected ? account.email : undefined;
  const { getValues } = useFormContext();
  const getInput = useOnboardingStore(state => state.getInput);
  const logoFile = useOnboardingStore(state => state.logoFile);
  const resetUser = useOnboardingStore(state => state.resetUser);
  const { mutateAsync: createOrganization } = useCreateOrganization();
  const { mutateAsync: updateOrganization } = useUpdateOrganization();
  const { mutateAsync: uploadLogo } = useUploadOrganizationLogo();
  const { changePlan, isCreatingStripeSession } = useStripePlan();
  const { setSelectedOrganization } = useSetSelectedOrganizationWithNavigation(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = isSubmitting || isCreatingStripeSession;

  const submitOnboarding = async (planSlug: string) => {
    if (!userId) {
      return;
    }

    setIsSubmitting(true);

    const { name, homepageUrl } = getValues();

    try {
      const orgData = await createOrganization({
        data: { organizationName: name, homepageUrl: homepageUrl || undefined, onboardingAnswersRaw: getInput(userId) },
      });

      try {
        // If we get an error from Zapier, log it to catch it on Sentry but continue without failing
        try {
          await axios.get(ZAPIER_WEBHOOK_URL, { params: { ...getInput(userId), email } });
        } catch (e) {
          console.error('Error submitting form to Zapier', e);
        }

        const organizationId = orgData.organization.id;

        if (logoFile) {
          const logoUrl = await uploadLogo({ organizationId, file: logoFile });
          await updateOrganization({ organizationId, data: { logoUrl } });
        }

        if (planSlug === FREE_PLAN_SLUG) {
          setSelectedOrganization();
          return;
        }
        if (planSlug.toUpperCase() === ENTERPRISE_PLAN_SLUG) {
          return;
        }
        resetUser(userId);
        await changePlan(planSlug, organizationId, location.origin);
      } catch (e) {
        triggerToast({
          variant: 'error',
          title: 'Error Updating Your Organization',
          body: "If your organization data isn't correct, contact Para support.",
        });
      }
    } catch (e) {
      triggerToast({
        variant: 'error',
        title: 'Error Creating Your Organization',
        body: 'Please try again. If the problem persists, contact Para support.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOnboarding, isLoading };
};
