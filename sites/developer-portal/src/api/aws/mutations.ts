import { axiosClient } from '../../clients/axios';

export const invalidateCloudFront = async (distribution: string, paths: string[]) => {
  const endpoint = `/aws/cloudfront/invalidate`;

  return axiosClient.post(endpoint, {
    distribution,
    paths,
  });
};
