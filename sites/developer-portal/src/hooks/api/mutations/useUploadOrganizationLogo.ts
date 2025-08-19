import { MutationOptions, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { getLogoUploadUrl } from '../../../api/organizations/mutations';
import { ENV_VARS, IS_DEV } from '../../../utils/constants';
import { Environment } from '../../../types/environment';
import { invalidateCloudFront } from '../../../api/aws/mutations';

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

      // Invalidating using a wildcard path due to an issue with CloudFront invalidations and special chars that seems to still be unresolved:
      // https://stackoverflow.com/questions/74047825/how-to-invalidate-a-cloudfront-path-that-contains-a-tilde-character
      // Get the first two path segments
      const pathSegments = fields.key.split('/');
      const rootPath = pathSegments.slice(0, 2).join('/');
      const invalidationPath = `/${rootPath}*`;

      await invalidateCloudFront('PARTNER_ASSETS', [invalidationPath]);

      return encodeURI(
        `https://partner-assets.${IS_DEV ? Environment.SANDBOX.toLowerCase() : ENV_VARS.environment.toLowerCase()}.getpara.com/${fields.key}`,
      );
    },
    ...options,
  });
};
