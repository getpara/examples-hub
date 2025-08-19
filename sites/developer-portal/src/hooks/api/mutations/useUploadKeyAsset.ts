import { MutationOptions, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Environment } from '@getpara/react-sdk';
import { getKeyAssetUploadUrl } from '../../../api/apiKeys/mutations';
import { PartnerAssetType } from '../../../types/api';
import { useParams } from 'react-router-dom';
import { invalidateCloudFront } from '../../../api/aws/mutations';

export const useUploadKeyAsset = (
  options?: MutationOptions<string, Error, { projectId: string; keyId: string; file: File; env: string }, unknown>,
) => {
  const { organizationId } = useParams();

  return useMutation<
    string,
    Error,
    { projectId: string; keyId: string; file: File; env: string; assetType: PartnerAssetType },
    unknown
  >({
    mutationFn: async vars => {
      const fileExt = vars.file.name.split('.').pop();

      if (!fileExt) {
        throw new Error('Invalid file name');
      }

      const postData = new FormData();

      const { url, fields } = await getKeyAssetUploadUrl({
        assetType: vars.assetType,
        organizationId: organizationId ?? '',
        projectId: vars.projectId,
        keyId: vars.keyId,
        env: vars.env,
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
        `https://partner-assets.${vars.env.toUpperCase() === Environment.DEV ? 'sandbox' : vars.env.toLowerCase()}.getpara.com/${fields.key}`,
      );
    },
    ...options,
  });
};
