import { MutationOptions, useMutation } from '@tanstack/react-query';
import { useAppStore } from '../../../stores/app/useAppStore';
import axios from 'axios';
import { Environment } from '@usecapsule/react-sdk';
import { getKeyAssetUploadUrl } from '../../../api/apiKeys/mutations';
import { PartnerAssetType } from '../../../types/api';

export const useUploadKeyAsset = (
  assetType: PartnerAssetType,
  options?: MutationOptions<string, Error, { projectId: string; keyId: string; file: File; env: string }, unknown>,
) => {
  const organizationId = useAppStore(state => state.getSelectedOrganization());

  return useMutation<string, Error, { projectId: string; keyId: string; file: File; env: string }, unknown>({
    mutationFn: async vars => {
      const fileExt = vars.file.name.split('.').pop();

      if (!fileExt) {
        throw new Error('Invalid file name');
      }

      const postData = new FormData();

      const { url, fields } = await getKeyAssetUploadUrl({
        assetType,
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
        }usecapsule.com/${fields.key}`,
      );
    },
    ...options,
  });
};
