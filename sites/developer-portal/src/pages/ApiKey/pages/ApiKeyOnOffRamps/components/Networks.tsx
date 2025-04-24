import { Button, FormField, useFormContext } from '@getpara/react-component-library';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { Network } from './Network';
import { getOnRampNetworks, Network as TNetwork } from '@getpara/react-sdk';
import { useState } from 'react';
import { useOnRampAllAssets } from '../../../../../hooks/api/queries/useOnRampAssets';
import { Plus } from 'lucide-react';

export const Networks = () => {
  const { data: allAssets } = useOnRampAllAssets();
  const form = useFormContext<OnOffRampsForm>();
  const [isAdding, setIsAdding] = useState(false);

  if (!allAssets) {
    return null;
  }

  return (
    <FormField
      control={form.control}
      name="onRampAssets"
      render={({ field: { ref: _, value, disabled } }) => {
        const selectedNetworks = Object.keys(value ?? {});

        const availableNetworks = getOnRampNetworks(allAssets).filter(network => !selectedNetworks.includes(network));

        if (!selectedNetworks.length) {
          return <Network />;
        }

        return (
          <div className="para:flex para:flex-col para:gap-4">
            {selectedNetworks.map(network => (
              <Network key={network} network={network as TNetwork} />
            ))}
            {isAdding && <Network onNetworkSelect={() => setIsAdding(false)} />}
            <div>
              <Button
                variant="neutral"
                disabled={disabled || !availableNetworks.length || isAdding}
                onClick={() => setIsAdding(true)}
              >
                <Plus />
                Add Another Network
              </Button>
            </div>
          </div>
        );
      }}
    />
  );
};
