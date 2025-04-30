import { Button, useFormContext } from '@getpara/react-component-library';

export const SettingsHeaderAction = () => {
  const form = useFormContext();

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  return (
    <Button variant="neutral" disabled={!canSave || isSubmitting} isLoading={isSubmitting} type="submit">
      Save Changes
    </Button>
  );
};
