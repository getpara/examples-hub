import { z } from 'zod';
import { useInviteMember } from '../../../hooks/api/mutations/useInviteMember';
import { toast, useForm } from '@getpara/react-component-library';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIsValidOrg } from '../../../hooks/useIsValidOrgConfig';
import { MemberRole } from '../../../types/api';
import { useParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { formatErrorMessage } from '../../../utils/formatErrorMessage';

const formSchema = z.object({
  emails: z.string().refine(
    v =>
      v
        .split(',')
        .map(v => v.trim())
        .every(item => z.string().email().safeParse(item).success),
    { message: 'Invalid email list, each item must be a valid email.' },
  ),
  role: z.nativeEnum(MemberRole),
  projectIds: z.array(z.string().uuid()).optional(),
});

export type InviteMemberSchema = z.infer<typeof formSchema>;

export const useInviteMembersForm = () => {
  const { organizationId } = useParams();
  const { mutateAsync: inviteMember } = useInviteMember();
  const isValidOrg = useIsValidOrg(organizationId);

  const onSubmit =
    (onSuccess: () => void) =>
    async ({ emails, role, projectIds }: InviteMemberSchema) => {
      if (isValidOrg) {
        const emailsSplit = emails.split(',').map(v => v.trim());

        const invitePromises: Promise<boolean>[] = [];
        for (const email of emailsSplit) {
          invitePromises.push(
            inviteMember({
              email,
              role,
              projectIds,
            }),
          );
        }

        const resolvedPromises = await Promise.allSettled(invitePromises);

        for (const prom of resolvedPromises) {
          if (prom.status === 'rejected') {
            const err = prom.reason;

            const message =
              ((err as AxiosError).response?.data as string) ?? 'If the problem persists, contact Para support.';

            toast.error('Failed to Invite Member', {
              description: formatErrorMessage(message),
            });
          }
        }

        if (!resolvedPromises.find(p => p.status === 'fulfilled')) {
          // The form will catch this error if all promises have failed so we don't show the success state
          throw new Error('all failed');
        }

        onSuccess();
      }
    };

  const form = useForm<InviteMemberSchema>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      role: MemberRole.ORG_MEMBER,
    },
    resolver: zodResolver(formSchema),
    disabled: !isValidOrg,
  });

  return { form, onSubmit };
};
