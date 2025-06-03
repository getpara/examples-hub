import {
  Button,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sheet,
  Typography,
  Form,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  FormMessage,
  Switch,
} from '@getpara/react-component-library';
import { MemberRole } from '../../../types/api';
import { FlatCard } from '../../../components/FlatCard';
import { formatDate } from '../../../utils/formatDate';
import { useUpdateMemberForm } from '../hooks/useUpdateMemberForm';
import { FormControl } from '../../../components/formComponents';
import { formatRole } from '../../../utils/organizationMemberHelpers';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';
import { useGetAllOrganizationMembers } from '../../../hooks/api/queries/useOrganizationMembers';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { RemoveMemberDialog } from './RemoveMemberDialog';
import { useState } from 'react';

type MemberSheetProps = {
  isOpen: boolean;
  memberId?: string;
  onClose: () => void;
};

export const MemberSheet = ({ isOpen, memberId, onClose }: MemberSheetProps) => {
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const { data: members } = useGetAllOrganizationMembers();
  const member = members?.find(m => m.id === memberId);
  const { form, onSubmit } = useUpdateMemberForm(memberId);
  const { data: projects } = useGetAllProjects();
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const role = form.watch('role');
  const isProjectMember = role === MemberRole.PROJECT_MEMBER;

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent>
        <Form {...form}>
          <form
            className="para:h-full para:flex para:flex-col para:gap-4 para:overflow-auto"
            onSubmit={form.handleSubmit(onSubmit(member?.id))}
          >
            <SheetHeader className="para:pb-0">
              <SheetTitle className="para:break-words">
                {member?.user?.name ?? member?.user?.email ?? member?.pendingEmail ?? ''}
              </SheetTitle>
              <SheetDescription className="para:break-words">
                {member?.user?.email ?? member?.pendingEmail ?? ''}
              </SheetDescription>
            </SheetHeader>
            <div className="para:flex para:flex-col para:gap-4 para:px-6">
              <FlatCard className="para:p-4 para:flex-row para:justify-between">
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  {!!member?.joinedAt ? 'Date Joined' : 'Invited'}
                </Typography>
                {!!member?.joinedAt && (
                  <Typography className="para:text-sm para:font-medium">{formatDate(member.joinedAt)}</Typography>
                )}
              </FlatCard>
              <FormField
                control={form.control}
                name="role"
                render={({ field: { ref: ref, ...restField } }) => (
                  <FormItem className="para:flex-1 ">
                    <FormLabel>Role</FormLabel>
                    <Select {...restField} value={restField.value ?? undefined} onValueChange={restField.onChange}>
                      <FormControl>
                        <SelectTrigger className="para:w-full para:mb-0!">
                          <SelectValue placeholder="Select Role" ref={ref} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(MemberRole).map(r => (
                          <SelectItem key={r} value={r} disabled={!capabilities?.assignableRoles.includes(r)}>
                            {formatRole(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {isProjectMember && (
                <FormField
                  control={form.control}
                  name="projectIds"
                  render={({ field: { value, onChange, disabled } }) => (
                    <FormItem className="para:flex-1 ">
                      <FormLabel>Project Access</FormLabel>{' '}
                      <FormControl>
                        <div className="para:flex para:flex-col para:border para:border-border para:rounded para:mb-0!">
                          {projects?.map(p => (
                            <div className="para:flex para:p-4 para:justify-between para:not-last:border-b-border para:not-last:border-b">
                              <Typography>{p.name}</Typography>
                              <Switch
                                checked={value?.includes(p.id)}
                                onCheckedChange={checked => {
                                  let newVal = value ?? [];
                                  if (checked) {
                                    newVal = [...newVal, p.id];
                                  } else {
                                    newVal = newVal.filter(v => v !== p.id);
                                  }

                                  onChange(newVal);
                                }}
                                disabled={disabled}
                              />
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div>
                <RemoveMemberDialog
                  memberId={memberId}
                  open={isRemoveDialogOpen}
                  setOpen={setIsRemoveDialogOpen}
                  onSuccess={onClose}
                />
              </div>
            </div>
            <SheetFooter className="para:flex-1 para:h-full para:flex para:justify-end">
              <div className="para:flex para:justify-end">
                <Button type="submit" variant="neutral" disabled={!canSave || isSubmitting} isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
