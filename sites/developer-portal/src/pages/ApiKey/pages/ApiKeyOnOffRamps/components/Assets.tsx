import {
  Button,
  FormField,
  FormItem,
  FormLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SlottedInput,
  useFormContext,
} from '@getpara/react-component-library';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { useOnRampAllAssets } from '../../../../../hooks/api/queries/useOnRampAssets';
import { getAssetCode, getOnRampAssets, OnRampAsset, Network as TNetwork } from '@getpara/react-sdk';
import { Trash2 } from 'lucide-react';
import { FormControl } from '../../../../../components/formComponents';
import clsx from 'clsx';

type AssetsProps = {
  network: TNetwork;
};

export const Assets = ({ network }: AssetsProps) => {
  const { data: allAssets } = useOnRampAllAssets();
  const form = useFormContext<OnOffRampsForm>();

  if (!allAssets) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="onRampAssets"
      render={({ field: { ref: _, value, disabled, onChange } }) => {
        // Safely typing here since this component is only rendered if the networkAssets value is an array
        let networkAssets = (value ?? {})[network];

        if (!Array.isArray(networkAssets)) {
          networkAssets = [];
        }

        const assetOptions = getOnRampAssets(allAssets, { network }).filter(
          a => !Array.isArray(networkAssets) || !networkAssets.includes(a),
        );

        const handleRemoveAsset = (asset: OnRampAsset) => () => {
          let newVal = { ...value };
          newVal[network] = networkAssets.filter(a => a !== asset);
          onChange(newVal);
        };

        return (
          <FormItem className="para:flex para:flex-col para:gap-4">
            {networkAssets.map((asset, index) => (
              <div key={asset}>
                {index === 0 && <FormLabel>Assets</FormLabel>}
                <SlottedInput
                  value={getAssetCode(asset)}
                  disabled
                  className={clsx({
                    'para:mt-0': index !== 0,
                    'para:mt-1': index === 0,
                  })}
                  inputClassName="para:disabled:opacity-100 para:text-ellipsis"
                  EndSlot={
                    <Button
                      variant="ghost"
                      className="para:h-full para:p-0 para:has-[>svg]:px-0 para:[&_svg]:stroke-muted-foreground para:hover:[&_svg]:stroke-foreground"
                      onClick={handleRemoveAsset(asset)}
                      disabled={disabled}
                    >
                      <Trash2 />
                    </Button>
                  }
                />
              </div>
            ))}
            {assetOptions?.length > 0 && (
              <div>
                {!networkAssets.length && <FormLabel>Assets</FormLabel>}
                <Select
                  value=""
                  disabled={disabled}
                  onValueChange={selectVal => {
                    let newVal = { ...value };
                    newVal[network] = [...networkAssets, selectVal as OnRampAsset];
                    onChange(newVal);
                  }}
                >
                  <FormControl>
                    <SelectTrigger
                      className={clsx('para:w-full para:mb-0!', {
                        'para:mt-0': !!networkAssets.length,
                      })}
                    >
                      <SelectValue placeholder="Select Asset" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {assetOptions.map(asset => (
                      <SelectItem key={asset} value={asset}>
                        {getAssetCode(asset)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
};
