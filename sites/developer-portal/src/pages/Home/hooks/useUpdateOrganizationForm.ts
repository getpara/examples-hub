import { z } from 'zod';
import { toast, useForm } from '@getpara/react-component-library';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsValidOrg } from '../../../hooks/useIsValidOrgConfig';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { AxiosError } from 'axios';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useUpdateOrganization } from '../../../hooks/api/mutations/useUpdateOrganization';

const formSchema = z.object({
  name: z.string(),
  logoUrl: z.string().optional().nullable(),
});

export type UpdateOrganizationSchema = z.infer<typeof formSchema>;

export const useUpdateOrganizationForm = () => {
  const { data: org } = useGetSelectedOrganization();
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const { organizationId } = useParams();
  const { mutate: updateOrganization } = useUpdateOrganization();
  const isValidOrg = useIsValidOrg(organizationId);

  const defaultValues = {
    name: org?.name ?? '',
    logoUrl: org?.logoUrl ?? '',
  };

  const form = useForm<UpdateOrganizationSchema>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
    resolver: zodResolver(formSchema),
    disabled: !isValidOrg || !capabilities?.canUpdateOrganization,
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(org)]);

  const onSubmit = async ({ name, logoUrl }: UpdateOrganizationSchema) => {
    if (!organizationId) {
      return;
    }

    updateOrganization(
      {
        organizationId,
        data: {
          name,
          logoUrl: logoUrl ?? undefined,
        },
      },
      {
        onError: err => {
          const message = ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

          toast.error('Failed to Update Organization', {
            description: formatErrorMessage(message),
          });

          form.reset(defaultValues);
        },
      },
    );
  };

  return { form, onSubmit };
};
