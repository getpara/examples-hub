import {
  cn,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Moonpay,
  Ramp,
  Stripe,
  Switch,
  Typography,
  useFormContext,
} from '@getpara/react-component-library';
import { OnRampProvider } from '@getpara/react-sdk';
import { FlatCard } from '../../../../../components/common';
import { GripHorizontal } from 'lucide-react';
import { Reorder, useDragControls } from 'framer-motion';
import { memo } from 'react';
import { OnOffRampsForm } from '../hooks/useOnOffRampsForm';
import { FormControl, FormMessage } from '../../../../../components/formComponents';

const PROVIDER_CONFIGS: Record<
  OnRampProvider,
  {
    title: string;
    value: OnRampProvider;
    Logo: JSX.Element;
    inputFormKey?: string;
  }
> = {
  [OnRampProvider.STRIPE]: {
    title: 'Stripe',
    value: OnRampProvider.STRIPE,
    Logo: <Stripe className="para:size-4" />,
  },
  [OnRampProvider.RAMP]: {
    title: 'Ramp',
    value: OnRampProvider.RAMP,
    Logo: <Ramp className="para:size-4" />,
    inputFormKey: 'rampApiKey',
  },
  [OnRampProvider.MOONPAY]: {
    title: 'Moonpay',
    value: OnRampProvider.MOONPAY,
    Logo: <Moonpay className="para:size-4" />,
  },
};

export const DraggableProvider = memo(
  ({
    provider,
    isSelected,
    disabled,
    onCheckedChange,
  }: {
    provider: OnRampProvider;
    isSelected: boolean;
    disabled: boolean;
    onCheckedChange: (checked: boolean) => void;
  }) => {
    const form = useFormContext<OnOffRampsForm>();
    const controls = useDragControls();
    const isProviderDragEnabled = !disabled && isSelected;

    return (
      <Reorder.Item as="div" key={provider} value={provider} dragListener={false} dragControls={controls} layout="position">
        <FlatCard className="para:p-4">
          <div className="para:flex para:flex-col para:gap-4">
            <div className="para:flex para:gap-4 para:items-center para:justify-between">
              <div className="para:flex para:gap-4 para:items-center">
                <GripHorizontal
                  className={cn('para:stroke-muted-foreground', {
                    'para:cursor-grab': isProviderDragEnabled,
                    'para:cursor-not-allowed': !isProviderDragEnabled,
                  })}
                  onPointerDown={e => {
                    if (isProviderDragEnabled) controls.start(e);
                  }}
                />
                <div className="para:flex para:items-center para:gap-1">
                  {PROVIDER_CONFIGS[provider].Logo}
                  <Typography>{PROVIDER_CONFIGS[provider].title}</Typography>
                </div>
              </div>
              <Switch checked={isSelected} onCheckedChange={onCheckedChange} disabled={disabled} />
            </div>
            {isSelected && PROVIDER_CONFIGS[provider].inputFormKey && (
              <FormField
                control={form.control}
                name="rampApiKey"
                render={({ field }) => (
                  <FormItem className={'para:flex-1'}>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={`Your ${PROVIDER_CONFIGS[provider].title} production API key`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </FlatCard>
      </Reorder.Item>
    );
  },
);
