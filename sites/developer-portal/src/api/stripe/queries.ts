import { axiosClient } from '../../clients/axios';
import { PlansResponse } from '../../types/api';

export const getPlans = async () => {
  const endpoint = `/stripe/plans`;

  return axiosClient.get<PlansResponse>(endpoint);
};
