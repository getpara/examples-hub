import { FormField, FormItem, FormLabel, Input, RadioGroup, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { BrandingForm } from '../hooks/useBrandingForm';
import { RadioGroupItem } from '../../../components/RadioGroupItem';

export const Emails = () => {
  const form = useFormContext<BrandingForm>();

  const [emailBackupKit, emailWelcome] = form.watch(['emailBackupKit', 'emailWelcome']);

  const formState = form.formState;

  const radioGroupValue =
    emailWelcome && emailBackupKit ? 'both' : emailWelcome ? 'welcome' : emailBackupKit ? 'backupKit' : 'none';

  const handleRadioChange = (value: string) => {
    switch (value) {
      case 'both': {
        form.setValue('emailBackupKit', true, { shouldDirty: true });
        form.setValue('emailWelcome', true, { shouldDirty: true });
        break;
      }
      case 'welcome': {
        form.setValue('emailBackupKit', false, { shouldDirty: true });
        form.setValue('emailWelcome', true, { shouldDirty: true });
        break;
      }
      case 'backupKit': {
        form.setValue('emailBackupKit', true, { shouldDirty: true });
        form.setValue('emailWelcome', false, { shouldDirty: true });
        break;
      }
      default:
      case 'none': {
        form.setValue('emailBackupKit', false, { shouldDirty: true });
        form.setValue('emailWelcome', false, { shouldDirty: true });
        break;
      }
    }
  };

  return (
    <ConfigCard title="Emails" subtitle="These emails are sent to users during onboarding and identity verification.">
      <div className="para:flex para:flex-col para:gap-4 para:flex-1">
        <FormField
          control={form.control}
          name="verifyUrl"
          render={({ field }) => (
            <FormItem className="para:flex-1">
              <FormLabel>Verification URL</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? undefined} placeholder="https://www.acme.com" />
              </FormControl>
              <FormDescription>The redirect URL back to your app shown in verification code emails.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <RadioGroup
          value={radioGroupValue}
          onValueChange={handleRadioChange}
          disabled={formState.disabled}
          className="para:gap-4"
        >
          <RadioGroupItem
            value="welcome"
            label="Welcome Email Only"
            subLabel="Only a welcome email will be sent to users."
          />
          <RadioGroupItem
            value="both"
            label="Welcome Email + Backup Kit"
            subLabel="A welcome email and a backup kit email will be sent to users."
          />
          <RadioGroupItem value="none" label="No Email" subLabel="No emails will be sent to users." />
        </RadioGroup>
      </div>
    </ConfigCard>
  );
};
