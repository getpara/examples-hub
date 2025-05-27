import { useQuery } from '@tanstack/react-query';
import { Plan } from '../../../types/api';
import { getPlans } from '../../../api/stripe/queries';
import { usePlanMetadata } from '../../configs/usePlanMetadata';

export const PLANS_QUERY_KEY = 'plans';

export const usePlansQuery = <T>(select: (data: Plan[]) => T) => {
  const { planMeta } = usePlanMetadata();

  return useQuery({
    queryKey: [PLANS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getPlans();

      // Sort data.plans based on the order of planMeta
      const planOrder = planMeta.map(meta => meta.slug);
      const sortedPlans = [...data.plans].sort((a, b) => planOrder.indexOf(a.slug) - planOrder.indexOf(b.slug));

      return sortedPlans;
    },
    select,
  });
};

export const usePlans = () => {
  return usePlansQuery(data => {
    return data;
  });
};

export const usePlan = (slug: string) => {
  return usePlansQuery(data => {
    return data.find(d => d.slug === slug);
  });
};
