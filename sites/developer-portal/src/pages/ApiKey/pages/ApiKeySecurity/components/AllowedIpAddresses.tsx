import { FormField, FormItem, FormLabel, Textarea, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';

export const AllowedIpAddresses = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="IP Allowlist"
      subtitle="Provide the CIDR blocks that can call Para's REST API endpoints. Requests from any other addresses are blocked even when using your secret key."
    >
      <FormField
        control={form.control}
        name="ipAllowlistCidrs"
        render={({ field }) => (
          <FormItem className="para:flex-1">
            <FormLabel>CIDR blocks</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? undefined}
                placeholder="e.g. 203.0.113.0/24, 2001:db8::/64, ::ffff:192.0.2.0/120"
                className="para:resize-none para:h-[112px]"
              />
            </FormControl>
            <FormDescription>
              Separate each value with a comma and use CIDR notation. IPv4, IPv6, and IPv4-mapped IPv6 ranges are supported.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
