import { MutationOptions, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { getLogoUploadUrl } from '../../../api/organizations/mutations';
import { ENV_VARS, IS_DEV, IS_PROD } from '../../../utils/constants';
import { Environment } from '../../../types/environment';

export const useUploadOrganizationLogo = (
  options?: MutationOptions<string, Error, { organizationId: string; file: File }, unknown>,
) => {
  return useMutation<string, Error, { organizationId: string; file: File }, unknown>({
    mutationFn: async vars => {
      const fileExt = vars.file.name.split('.').pop();

      if (!fileExt) {
        throw new Error('Invalid file name');
      }

      const postData = new FormData();

      const { url, fields } = await getLogoUploadUrl({
        organizationId: vars.organizationId,
        fileExt,
      });

      Object.entries(fields).forEach(([k, v]) => {
        postData.append(k, v);
      });

      postData.append('file', vars.file);

      await axios.post(url, postData);

      return encodeURI(
        `https://partner-assets.${IS_PROD ? '' : `${IS_DEV ? Environment.SANDBOX.toLowerCase() : ENV_VARS.environment.toLowerCase()}.`}usecapsule.com/${fields.key}`,
      );
    },
    ...options,
  });
};
