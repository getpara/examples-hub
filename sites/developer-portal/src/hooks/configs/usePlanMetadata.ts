import { ConfigResult, useConfig } from 'statsig-react';
import { useCallback, useMemo } from 'react';
import { PlanMetadata } from '../../types/planMetadata';

export const usePlanMetadata = () => {
  const { config }: ConfigResult = useConfig('plans');

  const planMeta = config.get<PlanMetadata[]>('plans', []);

  const planMetaBySlug: { [k: string]: PlanMetadata } = useMemo(
    () =>
      planMeta.reduce(
        (map, plan) => {
          map[plan.slug.toUpperCase()] = plan;
          return map;
        },
        {} as { [k: string]: PlanMetadata },
      ),
    [planMeta],
  );

  /**
   * Compare whether slugB is less than slugA
   * @param slugA First slug for comparison
   * @param slugB Second slug for comparison
   */
  const isLowerPlan = useCallback(
    (slugA: string, slugB: string) => {
      const aIndex = planMeta.findIndex(p => p.slug.toUpperCase() === slugA.toUpperCase());
      const bIndex = planMeta.findIndex(p => p.slug.toUpperCase() === slugB.toUpperCase());

      return bIndex < aIndex;
    },
    [planMeta],
  );

  return { planMeta, planMetaBySlug, isLowerPlan };
};
