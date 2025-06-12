import { FormField, FormItem, FormLabel, Textarea, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';

export const Origins = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="Allowed Origins"
      subtitle="This is the list of domains that are able to make requests on your Para instance. By default all domains are allowed. We recommend adding the domain’s of the apps where you will be integrating Para."
    >
      <FormField
        control={form.control}
        name="origins"
        render={({ field }) => (
          <FormItem className="para:flex-1">
            <FormLabel>Origin URLs</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? undefined}
                placeholder="e.g. www.origin-1.com, www.origin-2.com"
                className="para:resize-none para:h-[112px]"
              />
            </FormControl>
            <FormDescription>Separate each domain by a comma.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
