import { z } from 'zod';
import { toast, useForm } from '@getpara/react-component-library';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsValidOrg } from '../../../hooks/useIsValidOrgConfig';
import { useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { useCreateOrganization } from '../../../hooks/api/mutations/useCreateOrganization';
import { useUploadLogo } from '../../../pages/Home/hooks/useUploadLogo';
import { useCanCreateOrganization } from '../../../hooks/subscriptionGating/useCanCreateOrganization';

const formSchema = z.object({
  name: z.string(),
  logoFile: z.instanceof(File).optional().nullable(),
});

export type CreateOrganizationSchema = z.infer<typeof formSchema>;

export const useCreateOrganizationForm = (onSuccess: () => void) => {
  const { canCreateOrg } = useCanCreateOrganization();
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const { organizationId } = useParams();
  const { mutate: createOrganization } = useCreateOrganization();
  const isValidOrg = useIsValidOrg(organizationId);
  const { uploadLogo, isUpdatingOrg, isUploadingLogo } = useUploadLogo();

  const defaultValues = { name: '' };

  const form = useForm<CreateOrganizationSchema>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema),
    disabled: !isValidOrg || !capabilities?.canUpdateOrganization,
  });

  const onSubmit = async ({ name, logoFile }: CreateOrganizationSchema) => {
    if (!canCreateOrg || !organizationId) {
      return;
    }

    createOrganization(
      {
        data: {
          organizationName: name,
        },
      },
      {
        onSuccess: async data => {
          if (logoFile) {
            await uploadLogo(data.organization.id, logoFile);
          }
          onSuccess();
        },
        onError: err => {
          const message = ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

          toast.error('Failed to Create Organization', {
            description: formatErrorMessage(message),
          });

          form.reset(defaultValues);
        },
      },
    );
  };

  return { form, onSubmit, isUpdatingOrg, isUploadingLogo };
};
