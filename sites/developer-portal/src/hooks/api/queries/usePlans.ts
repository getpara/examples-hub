import { useQuery } from '@tanstack/react-query';
import { Plan } from '../../../types/api';
import { getPlans } from '../../../api/stripe/queries';

export const PLANS_QUERY_KEY = 'plans';

export const usePlansQuery = <T>(select: (data: Plan[]) => T) => {
  return useQuery({
    queryKey: [PLANS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getPlans();

      return data.plans;
    },
    select,
  });
};

export const usePlan = (slug: string) => {
  return usePlansQuery(data => {
    return (data.find(d => d.slug === slug)?.price ?? 0) / 100;
  });
};
