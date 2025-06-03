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
  useFormContext,
} from '@getpara/react-component-library';
import { FormControl } from '../../../../../components/formComponents';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { FlatCard } from '../../../../../components/FlatCard';
import { useOnRampAllAssets } from '../../../../../hooks/api/queries/useOnRampAssets';
import { getNetworkName, getOnRampNetworks, Network as TNetwork } from '@getpara/react-sdk';
import { AssetTabs } from './AssetTabs';
import { Assets } from './Assets';
import { renameObjKey } from '../helpers';

type NetworkProps = {
  network?: TNetwork;
  onNetworkSelect?: () => void;
};

export const Network = ({ network, onNetworkSelect }: NetworkProps) => {
  const { data: allAssets } = useOnRampAllAssets();
  const form = useFormContext<OnOffRampsForm>();

  if (!allAssets) {
    return null;
  }

  return (
    <FlatCard className="para:p-4 para:gap-4">
      <FormField
        control={form.control}
        name="onRampAssets"
        render={({ field: { ref: _, value, disabled, onChange } }) => {
          const selectedNetworks = Object.keys(value ?? {});

          const networks = getOnRampNetworks(allAssets).filter(n => n === network || !selectedNetworks.includes(n));

          return (
            <FormItem className="para:flex-1 para:flex para:flex-col para:gap-4">
              <div>
                <FormLabel>Network</FormLabel>
                <Select
                  value={network}
                  disabled={disabled}
                  onValueChange={selectVal => {
                    let newVal = { ...value };

                    if (network) {
                      newVal = renameObjKey({ oldObj: newVal, oldKey: network, newKey: selectVal });
                    }

                    newVal[selectVal] = true;
                    onChange(newVal);
                    onNetworkSelect?.();
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="para:w-full para:mb-0!">
                      <SelectValue placeholder="Select Network" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {networks.map(network => (
                      <SelectItem key={network} value={network}>
                        {getNetworkName(network)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {value && network && (
                <AssetTabs
                  value={value[network] === true ? 'all' : 'custom'}
                  CustomContent={<Assets network={network} />}
                  disabled={disabled}
                  onChange={tab => {
                    const newVal = { ...value };
                    newVal[network] = tab === 'all' ? true : [];
                    onChange(newVal);
                  }}
                />
              )}
              {!!selectedNetworks.length && (
                <div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      // If no network passed to the component, call onNetworkSelect to clear the adding network state
                      if (!network) {
                        onNetworkSelect?.();
                        return;
                      }
                      let newVal = { ...value };
                      delete newVal[network];
                      onChange(newVal);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </FormItem>
          );
        }}
      />
    </FlatCard>
  );
};
