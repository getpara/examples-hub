import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormField,
  FormItem,
  FormLabel,
  MultiSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@getpara/react-component-library';
import { Check, UserPlus } from 'lucide-react';
import { useInviteMembersForm } from '../hooks/useInviteMembersForm';
import { FormControl, FormMessage } from '../../../components/formComponents';
import { MemberRole } from '../../../types/api';
import { formatRole } from '../../../utils/organizationMemberHelpers';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';

type AddMemberDialogProps = {
  open: boolean;
  setOpen: (_: boolean) => void;
};

export const AddMemberDialog = ({ open, setOpen }: AddMemberDialogProps) => {
  const { form, onSubmit } = useInviteMembersForm();
  const { data: projects } = useGetAllProjects();

  const success = form.formState.isSubmitSuccessful;

  const role = form.watch('role');
  const isProjectMember = role === MemberRole.PROJECT_MEMBER;

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const onOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    setOpen(open);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger className="para:ml-auto" asChild>
        <Button variant="neutral">
          <UserPlus />
          Add Team Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            className="para:flex para:flex-col para:gap-4"
            onSubmit={form.handleSubmit(
              onSubmit(() => {
                setTimeout(() => {
                  setOpen(false);
                  form.reset();
                }, 2000);
              }),
            )}
          >
            <DialogHeader>
              <DialogTitle>Add Teammate</DialogTitle>
              <DialogDescription>These people will be sent a link to join your Para organization.</DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem className="para:flex-1">
                  <FormLabel>Teammate Email(s)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? undefined}
                      placeholder="Enter emails here, separated by commas."
                      className="para:resize-none para:h-[106px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field: { ref: ref, ...restField } }) => (
                <FormItem className="para:flex-1">
                  <FormLabel>Role</FormLabel>
                  <Select {...restField} value={restField.value ?? undefined} onValueChange={restField.onChange}>
                    <FormControl>
                      <SelectTrigger className="para:w-full">
                        <SelectValue placeholder="Select Role" ref={ref} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(MemberRole).map(r => (
                        <SelectItem key={r} value={r}>
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
                render={({ field: { onChange } }) => (
                  <FormItem className="para:flex-1">
                    <FormLabel>Project</FormLabel>
                    <FormControl>
                      <div>
                        <MultiSelect
                          className="para:min-h-12"
                          options={projects?.map(p => ({ value: p.id, label: p.name }))}
                          placeholder="Select project(s)"
                          emptyIndicator={
                            <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                              No results found.
                            </p>
                          }
                          hideClearAllButton
                          onChange={options => {
                            const _options = options.map(o => o.value);
                            onChange(_options);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <div className="para:flex para:justify-end">
                <Button
                  disabled={!canSave || isSubmitting || success}
                  isLoading={isSubmitting}
                  type="submit"
                  className={cn({
                    'para:bg-green-600': success,
                    'para:opacity-100!': success,
                  })}
                >
                  {success && <Check />}
                  {success ? 'Invites Sent' : 'Invite'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
