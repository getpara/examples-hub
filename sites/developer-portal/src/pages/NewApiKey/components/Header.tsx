import { Button, Typography, useFormContext } from '@getpara/react-component-library';
import { useParams } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  'setup': 'Setup',
  'users': 'Users',
  'analytics': 'Analytics',
  'branding': 'Branding',
  'security': 'Security',
  'on-off-ramps': 'On & Off Ramps',
  'permissions': 'Permissions',
};

export const Header = () => {
  const { apiKeyPage } = useParams();
  const form = useFormContext();

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const title = PAGE_TITLES[apiKeyPage ?? ''];

  return (
    <div className="para:flex para:justify-between para:items-center">
      <Typography className="para:text-2xl para:font-semibold">{title}</Typography>
      <Button variant="neutral" disabled={!canSave || isSubmitting} isLoading={isSubmitting} type="submit">
        Save Changes
      </Button>
    </div>
  );
};
