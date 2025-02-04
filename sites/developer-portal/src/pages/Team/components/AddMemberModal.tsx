import { CpslButton, CpslInput } from '@getpara/react-components';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm } from 'react-hook-form';
import { EMAIL_REGEX } from '../../../utils/regex';
import { useInviteMember } from '../../../hooks/api/mutations/useInviteMember';
import { triggerToast } from '../../../utils/toasts';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddMemberModal = ({ open, onClose }: AddMemberModalProps) => {
  const { mutate: inviteMember } = useInviteMember();
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const {
    control,
    formState: { isValid },
    getValues,
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const handleInviteClick = () => {
    if (orgValid) {
      inviteMember(
        { email: getValues('email') },
        {
          onSuccess: () => {
            onClose();
            triggerToast({
              variant: 'success',
              title: 'Member Invited!',
            });
          },
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Invite Member',
              body: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  const handleModalExited = () => {
    reset();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      onExited={handleModalExited}
      title="Add Member"
      subtitle="This person will be sent a link to join your Para organization."
    >
      <>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'An email is required.',
            pattern: {
              value: EMAIL_REGEX,
              message: 'Must be a valid email.',
            },
          }}
          render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
            <CpslInput
              label="Member Email"
              placeholder="Enter email address"
              onCpslInput={e => {
                onChange(e.detail.value);
              }}
              onCpslBlur={onBlur}
              value={value}
              errorText={error?.message}
            />
          )}
        />
        <CpslButton disabled={!isValid || !orgValid} fullWidth onClick={handleInviteClick}>
          Send Invite
        </CpslButton>
      </>
    </Modal>
  );
};
