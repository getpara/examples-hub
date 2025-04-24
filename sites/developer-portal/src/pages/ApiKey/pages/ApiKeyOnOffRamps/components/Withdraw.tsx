import { FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { SwitchCard } from '../../../components/SwitchCard';

export const Withdraw = () => {
  const form = useFormContext<OnOffRampsForm>();

  return (
    <ConfigCard title="Withdraw" subtitle="Enable your users to sell crypto for fiat currency.">
      <FormField
        control={form.control}
        name="isWithdrawEnabled"
        render={({ field: { ref: _, onChange, value, disabled } }) => (
          <FormItem className="para:flex-1">
            <FormControl>
              <SwitchCard
                disabled={disabled}
                onCheckedChange={onChange}
                label="Status"
                checked={!!value}
                value={undefined}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
