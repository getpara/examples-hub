import { MutationOptions, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Environment } from '@getpara/react-sdk';
import { getKeyAssetUploadUrl } from '../../../api/apiKeys/mutations';
import { PartnerAssetType } from '../../../types/api';
import { useParams } from 'react-router-dom';

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

      return encodeURI(
        `https://partner-assets.${
          vars.env.toUpperCase() === Environment.PROD
            ? ''
            : `${vars.env.toUpperCase() === Environment.DEV ? 'sandbox' : vars.env.toLowerCase()}.`
        }getpara.com/${fields.key}`,
      );
    },
    ...options,
  });
};
