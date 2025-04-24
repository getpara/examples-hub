import { FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl } from '../../../../../components/formComponents';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { ConfigCardContent } from '../../../components/ConfigCardContent';
import { SwitchCard } from '../../../components/SwitchCard';
import { DefaultAssetConfig } from './DefaultAssetConfig';

export const DefaultAsset = () => {
  const form = useFormContext<OnOffRampsForm>();

  return (
    <ConfigCardContent
      title="Default Asset"
      subtitle="Set the default asset and amount that will be auto-populated when a user attempts to buy or sell crypto from one of the on-ramp providers."
    >
      <div className="para:flex para:flex-col para:gap-4 para:flex-1">
        <FormField
          control={form.control}
          name="defaultBuyAmount"
          render={({ field: { ref: _, onChange, value, disabled } }) => (
            <FormItem className="para:flex-1">
              <FormControl>
                <SwitchCard
                  disabled={disabled}
                  onCheckedChange={checked => {
                    onChange(checked ? '0' : null);
                  }}
                  label="Status"
                  checked={value !== null && value !== undefined}
                  value={undefined}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <DefaultAssetConfig />
      </div>
    </ConfigCardContent>
  );
};
