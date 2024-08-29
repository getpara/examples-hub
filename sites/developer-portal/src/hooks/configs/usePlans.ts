import { ConfigResult, useConfig } from 'statsig-react';
import { Plan } from '../../types/plan';
import { useCallback, useMemo } from 'react';

export const usePlans = () => {
  const { config }: ConfigResult = useConfig('plans');

  const plans = config.get<Plan[]>('plans', []);

  const plansBySlug: { [k: string]: Plan } = useMemo(
    () =>
      plans.reduce(
        (map, plan) => {
          map[plan.slug] = plan;
          return map;
        },
        {} as { [k: string]: Plan },
      ),
    [plans],
  );

  /**
   * Compare whether slugB is less than slugA
   * @param slugA First slug for comparison
   * @param slugB Second slug for comparison
   */
  const isLowerPlan = useCallback(
    (slugA: string, slugB: string) => {
      const aIndex = plans.findIndex(p => p.slug === slugA);
      const bIndex = plans.findIndex(p => p.slug === slugB);

      return bIndex < aIndex;
    },
    [plans],
  );

  return { plans, plansBySlug, isLowerPlan };
};
