import { axiosClient } from '../../clients/axios';
import { OnRampAllAssetsResponse } from '../../types/api';

export const getOnRampAllAssets = async () => {
  const endpoint = `/on-ramp-config/all-assets`;

  return axiosClient.get<OnRampAllAssetsResponse>(endpoint);
};
