import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Typography,
} from '@getpara/react-component-library';
import { useCreateOrganizationForm } from './hooks/useCreateOrganizationForm';
import { FormControl, FormMessage } from '../formComponents';
import { UploadButton } from '../UploadButton';
import { useState } from 'react';
import { useCanCreateOrganization } from '../../hooks/subscriptionGating/useCanCreateOrganization';

type CreateOrgDialogProps = {
  open: boolean;
  setOpen: (_: boolean) => void;
};

export const CreateOrgDialog = ({ open, setOpen }: CreateOrgDialogProps) => {
  const { canCreateOrg } = useCanCreateOrganization();
  const { form, onSubmit, isUpdatingOrg, isUploadingLogo } = useCreateOrganizationForm(() => {
    setOpen(false);
  });
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled && !isUpdatingOrg && !isUploadingLogo;

  const onOpenChange = (open: boolean) => {
    setOpen(open);
  };

  if (!canCreateOrg) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <Form {...form}>
          <form
            className="para:h-full para:flex para:flex-col para:gap-4 para:overflow-auto"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <DialogHeader>
              <DialogTitle>New Organization</DialogTitle>
              <DialogDescription>
                Give your organization a unique name and logo to help others recognize it.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="para:w-full para:flex-1">
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? undefined} placeholder="Enter a name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="para:flex para:flex-col para:gap-2">
              <div className="para:flex para:flex-col para:gap-1">
                <Typography className="para:font-medium">Logo</Typography>
                <Typography color="muted" className="para:text-xs para:font-medium">
                  Size: 80px x 80px
                </Typography>
              </div>
              <UploadButton
                idPrefix="logoUrl"
                onInputChange={ev => {
                  const file = ev.target?.files?.[0] ?? null;
                  form.setValue('logoFile', file, { shouldDirty: true });

                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setLogoDataUrl(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setLogoDataUrl(null);
                  }
                }}
                isLoading={isUploadingLogo}
                buttonClassName="para:w-[80px]"
                value={logoDataUrl ?? ''}
              />
            </div>
            <DialogFooter>
              <div>
                <Button
                  disabled={!canSave || isSubmitting}
                  isLoading={isSubmitting || isUpdatingOrg || isUploadingLogo}
                  type="submit"
                >
                  Create
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
