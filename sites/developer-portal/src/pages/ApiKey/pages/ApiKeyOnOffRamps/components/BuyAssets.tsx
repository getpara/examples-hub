import { FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { ConfigCardContent } from '../../../components/ConfigCardContent';
import { Globe, Settings2 } from 'lucide-react';
import { ReactNode } from 'react';
import { Networks } from './Networks';
import { AssetTabs } from './AssetTabs';

export const ASSET_TABS: { label: string; value: string; Icon: ReactNode }[] = [
  { label: 'All Available Networks', value: 'all', Icon: <Globe /> },
  { label: 'Custom Selection', value: 'custom', Icon: <Settings2 /> },
];

export const BuyAssets = () => {
  const form = useFormContext<OnOffRampsForm>();

  return (
    <ConfigCardContent
      title="Assets"
      subtitle="Configure which assets you want to offer in your modal. The configured providers will limit users to purchasing these assets only."
    >
      <FormField
        control={form.control}
        name="onRampAssets"
        render={({ field: { ref: _, value, disabled, onChange } }) => {
          const tabValue = !value ? 'all' : 'custom';

          return (
            <FormItem className="para:flex-1">
              <FormControl>
                <AssetTabs
                  value={tabValue}
                  CustomContent={<Networks />}
                  disabled={disabled}
                  onChange={value => {
                    onChange(value === 'all' ? null : {});
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </ConfigCardContent>
  );
};
