import { AssetMetadataIndexed } from '@getpara/web-sdk';
import { useInternalClient } from '../utils/useInternalClient.js';
import { useQuery, UseQueryResult } from '@tanstack/react-query';

export const useAssetInfo = (): UseQueryResult<AssetMetadataIndexed> => {
  const client = useInternalClient();

  return useQuery({
    enabled: !!client,
    queryKey: ['useAssetInfo'],
    staleTime: 15000,
    queryFn: async () => {
      const { assets } = await client?.ctx.client.getAssetInfo();

      return assets;
    },
  });
};
