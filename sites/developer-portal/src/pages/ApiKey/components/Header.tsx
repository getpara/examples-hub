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

const PAGE_SUBTITLES: Record<string, string> = {
  'setup': '',
  'users': '',
  'analytics': '',
  'branding':
    'These settings will be applied to Capsule Portal and Emails only. Customizing your Capsule Modal is done with the Capsule SDK.',
  'security': '',
  'on-off-ramps': '',
  'permissions': '',
};

export const Header = () => {
  const { apiKeyPage } = useParams();
  const form = useFormContext();

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const title = PAGE_TITLES[apiKeyPage ?? ''];
  const subtitle = PAGE_SUBTITLES[apiKeyPage ?? ''];

  return (
    <div className="para:flex para:flex-col para:flex-1">
      <div className="para:flex para:justify-between para:items-center">
        <Typography className="para:text-2xl para:font-semibold">{title}</Typography>
        <Button variant="neutral" disabled={!canSave || isSubmitting} isLoading={isSubmitting} type="submit">
          Save Changes
        </Button>
      </div>
      {subtitle && (
        <Typography color="secondary" className="para:text-sm para:font-medium para:mt-2">
          {subtitle}
        </Typography>
      )}
    </div>
  );
};
