import { useQuery } from '@tanstack/react-query';
import { getOnRampAllAssets } from '../../../api/onRampAssets/queries';

export const ON_RAMP_ALL_ASSETS_QUERY_KEY = 'onRampAllAssets';

export const useOnRampAllAssets = () => {
  return useQuery({
    queryKey: [ON_RAMP_ALL_ASSETS_QUERY_KEY],
    queryFn: async () => {
      const { data } = await getOnRampAllAssets();

      return data;
    },
  });
};
