import { Button, useFormContext } from '@getpara/react-component-library';
import { Copy } from 'lucide-react';
import { CopyToDialog } from './CopyToDialog';
import { useState } from 'react';

export const SettingsHeaderAction = () => {
  const form = useFormContext();
  const [isCopyToDialogOpen, setIsCopyToDialogOpen] = useState(false);

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const handleCopyToClick = () => {
    setIsCopyToDialogOpen(true);
  };

  return (
    <>
      <div className="para:flex para:gap-2">
        <Button variant="outline" onClick={handleCopyToClick}>
          <Copy />
          Copy to
        </Button>
        <Button variant="neutral" disabled={!canSave || isSubmitting} isLoading={isSubmitting} type="submit">
          Save Changes
        </Button>
      </div>
      <CopyToDialog open={isCopyToDialogOpen} setIsOpen={setIsCopyToDialogOpen} />
    </>
  );
};
