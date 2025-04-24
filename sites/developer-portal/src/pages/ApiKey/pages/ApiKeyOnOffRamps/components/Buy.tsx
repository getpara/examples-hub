import { FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { SwitchCard } from '../../../components/SwitchCard';
import { BuyContent } from './BuyContent';

export const Buy = () => {
  const form = useFormContext<OnOffRampsForm>();

  const isBuyEnabled = form.watch('isBuyEnabled');

  return (
    <ConfigCard
      title="Buy Crypto"
      subtitle="Configure which assets you want to offer in your modal. The configured providers will limit users to purchasing these assets only."
      className="para:md:flex-col!"
    >
      <FormField
        control={form.control}
        name="isBuyEnabled"
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
      {isBuyEnabled && <BuyContent />}
    </ConfigCard>
  );
};
