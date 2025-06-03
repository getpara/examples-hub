import {
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Typography,
} from '@getpara/react-component-library';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { useGetSelectedOrganization } from '../../../hooks/api/queries/useOrganizations';
import { useUpdateOrganizationForm } from '../hooks/useUpdateOrganizationForm';
import { FormControl, FormMessage } from '../../../components/formComponents';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { UploadButton } from '../../../components/UploadButton';
import { useUploadLogo } from '../hooks/useUploadLogo';

export const SettingsSheet = () => {
  const { organizationId } = useParams();
  const { data: org } = useGetSelectedOrganization();
  const { data: capabilities } = useOrganizationMemberCapabilities();
  const isOpen = !!useMatch(`/${organizationId}/dashboard/settings`) && capabilities?.canUpdateOrganization;
  const navigate = useNavigate();
  const { form, onSubmit } = useUpdateOrganizationForm();
  const { uploadLogo, isUpdatingOrg, isUploadingLogo } = useUploadLogo();

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      navigate(`/${organizationId}/dashboard`);
    }
  };

  const handleUpload = (file?: File | null) => {
    if (!file) {
      return;
    }

    uploadLogo(organizationId!, file, form);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent>
        <Form {...form}>
          <form
            className="para:h-full para:flex para:flex-col para:gap-4 para:overflow-auto"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <SheetHeader className="para:pb-0">
              <SheetTitle className="para:break-words">{org?.name}</SheetTitle>
            </SheetHeader>
            <div className="para:flex para:flex-col para:gap-4 para:px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="para:w-full para:flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? undefined} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field: { ref: _, ...restField }, fieldState: { error } }) => (
                  <FormItem className="para:flex-1">
                    <FormLabel>
                      <div className="para:flex para:flex-col para:gap-1 para:mb-2">
                        <Typography className="para:font-medium">Logo</Typography>
                        <Typography color="muted" className="para:text-xs para:font-medium">
                          Size: 80px x 80px
                        </Typography>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <UploadButton
                        idPrefix="logoUrl"
                        onInputChange={ev => {
                          handleUpload(ev.target?.files?.[0]);
                        }}
                        isLoading={isUploadingLogo}
                        error={!!error}
                        buttonClassName="para:w-[80px]"
                        {...restField}
                        value={restField.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="para:flex-1 para:h-full para:flex para:justify-end">
              <div className="para:flex para:justify-end">
                <Button
                  type="submit"
                  variant="neutral"
                  disabled={!canSave || isSubmitting || isUpdatingOrg}
                  isLoading={isSubmitting || isUpdatingOrg}
                >
                  {isDirty ? 'Save' : 'No Unsaved'} Changes
                </Button>
              </div>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};
