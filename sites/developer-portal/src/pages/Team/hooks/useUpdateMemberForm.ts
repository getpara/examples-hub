import { z } from 'zod';
import { toast, useForm } from '@getpara/react-component-library';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsValidOrg } from '../../../hooks/useIsValidOrgConfig';
import { MemberRole } from '../../../types/api';
import { useParams } from 'react-router-dom';
import { useUpdateMember } from '../../../hooks/api/mutations/useUpdateMember';
import { useEffect } from 'react';
import { useGetAllOrganizationMembers } from '../../../hooks/api/queries/useOrganizationMembers';
import { AxiosError } from 'axios';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';

const formSchema = z.object({
  role: z.nativeEnum(MemberRole),
  projectIds: z.array(z.string().uuid()).optional(),
});

export type UpdateMemberSchema = z.infer<typeof formSchema>;

export const useUpdateMemberForm = (memberId?: string) => {
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const { organizationId } = useParams();
  const { data: members } = useGetAllOrganizationMembers();
  const member = members?.find(m => m.id === memberId);
  const { mutate: updateMember } = useUpdateMember();
  const isValidOrg = useIsValidOrg(organizationId);

  const defaultValues = {
    role: member?.role as MemberRole,
    projectIds: member?.projects?.map(p => p.id),
  };

  const form = useForm<UpdateMemberSchema>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
    resolver: zodResolver(formSchema),
    disabled: !isValidOrg || !capabilities?.assignableRoles.includes(member?.role as MemberRole),
  });

  useEffect(() => {
    form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(member)]);

  const onSubmit =
    (memberId?: string) =>
    async ({ role, projectIds }: UpdateMemberSchema) => {
      if (!memberId) {
        return;
      }

      updateMember(
        {
          memberId,
          data: {
            owner: false,
            permissions: [],
            role,
            projectIds,
          },
        },
        {
          onError: err => {
            const message =
              ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

            toast.error('Failed to Update Member', {
              description: formatErrorMessage(message),
            });

            form.reset(defaultValues);
          },
        },
      );
    };

  return { form, onSubmit };
};
