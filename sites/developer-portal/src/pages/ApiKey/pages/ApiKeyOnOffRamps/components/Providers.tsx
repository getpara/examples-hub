import { FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { ConfigCardContent } from '../../../components/ConfigCardContent';
import { OnRampProvider } from '@getpara/react-sdk';
import { Reorder } from 'framer-motion';
import { DraggableProvider } from './DraggableProvider';

export const Providers = () => {
  const form = useFormContext<OnOffRampsForm>();

  return (
    <ConfigCardContent
      title="Providers"
      subtitle="Configure which providers to display in your modal. The provider buttons will be displayed in the order below, if they offer your specified assets and if the user's selected wallet is a qualifying type."
    >
      <FormField
        control={form.control}
        name="onRampProviders"
        render={({ field: { ref: _, value, disabled, onChange } }) => {
          const providers: OnRampProvider[] = [
            ...(value ?? []),
            ...(Object.keys(OnRampProvider).filter(key => !value?.includes(key as OnRampProvider)) as OnRampProvider[]),
          ];

          return (
            <FormItem className="para:flex-1">
              <FormControl>
                <Reorder.Group
                  className="para:flex para:flex-col para:gap-2"
                  as="div"
                  values={value ?? []}
                  onReorder={onChange}
                >
                  {providers.map(provider => (
                    <DraggableProvider
                      provider={provider}
                      key={provider}
                      isSelected={!!value?.includes(provider)}
                      disabled={!!disabled}
                      onCheckedChange={checked => {
                        let newVal = value ?? [];
                        if (checked) {
                          newVal = [...newVal, provider];
                        } else {
                          newVal = newVal.filter(v => v !== provider);
                        }

                        onChange(newVal);
                      }}
                    />
                  ))}
                </Reorder.Group>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </ConfigCardContent>
  );
};
