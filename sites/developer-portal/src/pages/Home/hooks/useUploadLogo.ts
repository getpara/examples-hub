import { useParams } from 'react-router-dom';
import { useUpdateOrganization } from '../../../hooks/api/mutations/useUpdateOrganization';
import { useUploadOrganizationLogo } from '../../../hooks/api/mutations/useUploadOrganizationLogo';
import { UseFormReturn } from '@getpara/react-component-library';
import { UpdateOrganizationSchema } from './useUpdateOrganizationForm';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';

export const useUploadLogo = () => {
  const { organizationId } = useParams();
  const { mutateAsync: uploadOrgLogo, isPending: isUploadingLogo } = useUploadOrganizationLogo();
  const { mutate: updateOrganization, isPending: isUpdatingOrg } = useUpdateOrganization();
  const { data: org } = useGetSelectedOrganization();

  const uploadLogo = (file?: File | null, form?: UseFormReturn<UpdateOrganizationSchema>) => {
    if (!file) {
      return;
    }

    uploadOrgLogo(
      { organizationId: organizationId!, file },
      {
        onSuccess: async url => {
          // If the image url hasn't ever been set, save the key config
          // If it has been set, updating the image in S3 is all we need to do
          if (url !== org?.logoUrl) {
            form?.setValue('logoUrl', url);
            await updateOrganization({
              organizationId: organizationId!,
              data: {
                logoUrl: url,
              },
            });
          }
        },
        onError: () => {
          form?.setError('logoUrl', new Error('Something went wrong. Please try again.'));
        },
      },
    );
  };

  return { uploadLogo, isUploadingLogo, isUpdatingOrg };
};
