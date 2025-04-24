import { FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { SwitchCard } from '../../../components/SwitchCard';

export const Receive = () => {
  const form = useFormContext<OnOffRampsForm>();

  return (
    <ConfigCard title="Receive" subtitle="Display your users' wallet addresses and a QR code for receiving funds.">
      <FormField
        control={form.control}
        name="isReceiveEnabled"
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
