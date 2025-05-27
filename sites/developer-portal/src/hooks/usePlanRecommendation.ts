import { useMemo } from 'react';
import { usePlan, usePlans } from './api/queries/usePlans';
import { usePremiumFeatures } from './api/queries/usePremiumFeatures';
import { PlanSlug } from '../utils/constants';

export const usePlanRecommendation = (planSlug?: PlanSlug) => {
  const { data: plan } = usePlan(planSlug ?? '');
  const { data: allPlans } = usePlans();
  const { data: premiumFeatures } = usePremiumFeatures();

  const changeRecommendation = useMemo(() => {
    if (!allPlans || !plan || !premiumFeatures?.prodFeatures) {
      return { recommendedPlan: planSlug, higherPlanRecommended: false };
    }

    const requiredFeatures = [
      {
        isEnabled: !!premiumFeatures.prodFeatures.isUsingNativePasskeys,
        planProp: 'canUseNativePasskeys',
      },
      {
        isEnabled: !!premiumFeatures.prodFeatures.isUsingPregen,
        planProp: 'canPregen',
      },
      // Add more features here as needed
    ];
    // Filter only enabled features
    const enabledFeatures = requiredFeatures.filter(f => f.isEnabled);

    const currentPlanSupportsAll = enabledFeatures.every(feature => plan[feature.planProp]);
    if (currentPlanSupportsAll) {
      return { recommendedPlan: planSlug, higherPlanRecommended: false };
    }

    // Find the highest plan that supports all enabled features
    const lowestSupportingPlan = allPlans.find(plan => enabledFeatures.every(feature => plan[feature.planProp]));

    const recommendedPlan = lowestSupportingPlan ? lowestSupportingPlan.slug : planSlug;

    return { recommendedPlan, higherPlanRecommended: recommendedPlan !== planSlug };
  }, [allPlans, plan, planSlug, premiumFeatures?.prodFeatures]);

  const upgradeRecommendation = useMemo(() => {
    if (!allPlans || !plan || !premiumFeatures?.betaFeatures) {
      return { recommendedPlan: planSlug, higherPlanRecommended: false };
    }

    const requiredFeatures = [
      {
        isEnabled: !!premiumFeatures.betaFeatures.isUsingNativePasskeys,
        planProp: 'canUseNativePasskeys',
      },
      {
        isEnabled: !!premiumFeatures.betaFeatures.isUsingPregen,
        planProp: 'canPregen',
      },
      // Add more features here as needed
    ];
    // Filter only enabled features
    const enabledFeatures = requiredFeatures.filter(f => f.isEnabled);

    const currentPlanSupportsAll = enabledFeatures.every(feature => plan[feature.planProp]);
    if (currentPlanSupportsAll) {
      return { recommendedPlan: planSlug, higherPlanRecommended: false };
    }

    // Find the highest plan that supports all enabled features
    const lowestSupportingPlan = allPlans.find(plan => enabledFeatures.every(feature => plan[feature.planProp]));

    const recommendedPlan = lowestSupportingPlan ? lowestSupportingPlan.slug : planSlug;

    return { recommendedPlan, higherPlanRecommended: recommendedPlan !== planSlug };
  }, [allPlans, plan, planSlug, premiumFeatures?.betaFeatures]);

  return { upgradeRecommendation, changeRecommendation };
};
