import { FormField, FormItem, FormLabel, Textarea, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';

export const AllowedIpAddresses = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="Allowed IP Addresses"
      subtitle="This is the list of IP addresses that can call Para's REST API endpoints. Requests from any other IP addresses, even if they are using your secret key, will be blocked."
    >
      <FormField
        control={form.control}
        name="allowedIps"
        render={({ field }) => (
          <FormItem className="para:flex-1">
            <FormLabel>IP Addresses</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? undefined}
                placeholder="e.g. 192.168.1.1, 10.0.0.1, 2001:db8::1"
                className="para:resize-none para:h-[112px]"
              />
            </FormControl>
            <FormDescription>Separate each address by a comma. Supports both IPv4 and IPv6 addresses.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
