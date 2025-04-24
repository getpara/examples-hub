import {
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
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { useEffect, useMemo } from 'react';
import { getOnRampAssets, getOnRampNetworks, Network, OnRampAsset } from '@getpara/react-sdk';
import { useOnRampAllAssets } from '../../../../../hooks/api/queries/useOnRampAssets';
import { DollarSign } from 'lucide-react';
import { formatAssetOption, formatAssetOptionName, parseAssetOption } from '../helpers';

export const DefaultAssetConfig = () => {
  const { data: allAssets } = useOnRampAllAssets();
  const form = useFormContext<OnOffRampsForm>();

  const [defaultBuyAmount, defaultOnRampNetwork, defaultOnRampAsset, onRampAssets] = form.watch([
    'defaultBuyAmount',
    'defaultOnRampNetwork',
    'defaultOnRampAsset',
    'onRampAssets',
  ]);

  const assetOptions = useMemo(() => {
    let options: string[] = [];
    if (!allAssets) {
      return options;
    }

    if (onRampAssets === null) {
      const networks = getOnRampNetworks(allAssets);

      networks.forEach(network => {
        options = options.concat(
          getOnRampAssets(allAssets, { network: network as Network }).map(a => formatAssetOption(a, network)),
        );
      });
      return options;
    }

    Object.entries(onRampAssets ?? {}).forEach(([network, assets]) => {
      let availableAssets: OnRampAsset[] = [];

      if (assets === true) {
        availableAssets = getOnRampAssets(allAssets, { network: network as Network });
      } else {
        availableAssets = assets;
      }
      availableAssets.forEach(a => options.push(formatAssetOption(a, network)));
    });
    return options;
  }, [allAssets, onRampAssets]);

  // Clear selection if it's no longer valid based on the selected networks/assets
  useEffect(() => {
    if (defaultOnRampAsset && defaultOnRampNetwork) {
      const currentSelection = formatAssetOption(defaultOnRampAsset ?? '', defaultOnRampNetwork ?? '');

      if (!assetOptions.includes(currentSelection)) {
        form.setValue('defaultOnRampNetwork', null);
        form.setValue('defaultOnRampAsset', null);
      }
    }
  }, [assetOptions, defaultOnRampAsset, defaultOnRampNetwork, form]);

  if (defaultBuyAmount === null || defaultBuyAmount === undefined) {
    return null;
  }

  return (
    <div className="para:flex para:flex-col para:md:flex-row para:gap-4 para:flex-1">
      <FormField
        control={form.control}
        name="defaultOnRampAsset"
        render={({ field: { ref: ref, ...restField } }) => {
          return (
            <FormItem className="para:flex-1">
              <FormLabel>Asset</FormLabel>
              <Select
                {...restField}
                value={restField.value ? formatAssetOption(restField.value, defaultOnRampNetwork ?? '') : ''}
                onValueChange={value => {
                  if (!value) {
                    restField.onChange(null);
                    form.setValue('defaultOnRampNetwork', null);
                    return;
                  }

                  const { asset, network } = parseAssetOption(value);

                  restField.onChange(asset);
                  form.setValue('defaultOnRampNetwork', network as Network);
                }}
              >
                <FormControl>
                  <SelectTrigger className="para:w-full">
                    <SelectValue placeholder="Select Framework" ref={ref} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {assetOptions.map(o => (
                    <SelectItem key={o} value={o}>
                      {formatAssetOptionName(o)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          );
        }}
      />
      <FormField
        control={form.control}
        name="defaultBuyAmount"
        render={({ field }) => (
          <FormItem className={'para:flex-1'}>
            <FormLabel>Value</FormLabel>
            <FormControl>
              <SlottedInput
                {...field}
                value={field.value ?? ''}
                placeholder="0.00"
                inputClassName="para:pl-0"
                className="para:gap-1"
                StartSlot={<DollarSign className="para:stroke-muted-foreground para:ml-3 para:size-4" />}
                type="number"
                min={0}
                max={999_999}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
