import { FormField, FormItem, FormLabel, Input, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription } from '../../../../../components/formComponents';
import { VisibilityInput } from '../../../../../components/VisibilityInput';
import { SetupForm } from '../hooks/useSetupForm';
import { ConfigCard } from '../../../components/ConfigCard';

export const KeyData = () => {
  const form = useFormContext<SetupForm>();

  return (
    <ConfigCard className="para:md:flex-col">
      <>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="para:w-full para:flex-1">
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? undefined} className="para:disabled:opacity-100" />
              </FormControl>
              <FormDescription>Your project name will be shown to users</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem className="para:w-full para:flex-1">
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <VisibilityInput
                  {...field}
                  disabled
                  inputClassName="para:disabled:opacity-100 para:text-ellipsis"
                  showCopyButton
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="secretApiKey"
          render={({ field }) => (
            <FormItem className="para:w-full para:flex-1">
              <FormLabel>Secret API Key</FormLabel>
              <FormControl>
                <VisibilityInput
                  {...field}
                  disabled
                  inputClassName="para:disabled:opacity-100 para:text-ellipsis"
                  showCopyButton
                />
              </FormControl>
              <FormDescription>
                The Secret API Key is for use on your back-end services only. Be sure to keep it confidential.
              </FormDescription>
            </FormItem>
          )}
        />
      </>
    </ConfigCard>
  );
};
