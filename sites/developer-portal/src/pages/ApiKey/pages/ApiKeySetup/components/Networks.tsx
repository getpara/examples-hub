import {
  Cosmos,
  Checkbox,
  EVM,
  FormField,
  FormItem,
  Solana,
  Switch,
  Typography,
  useFormContext,
  Label,
} from '@getpara/react-component-library';
import { SetupForm } from '../hooks/useSetupForm';
import { ConfigCard } from '../../../components/ConfigCard';
import { WALLET_TYPES, TWalletType } from '@getpara/react-sdk';
import { FlatCard } from '../../../../../components/common';
import { ReactNode } from 'react';

export const WALLET_TYPE_CONFIG: Record<TWalletType, { name: string; Icon: ReactNode }> = {
  EVM: {
    name: 'Ethereum Virtual Machine (Includes Ethereum Layer 2s)',
    Icon: <EVM className="para:size-5 para:min-w-5" />,
  },
  SOLANA: { name: 'Solana', Icon: <Solana className="para:size-5 para:min-w-5" /> },
  COSMOS: { name: 'Cosmos', Icon: <Cosmos className="para:size-5 para:min-w-5" /> },
};

export const Networks = () => {
  const form = useFormContext<SetupForm>();

  return (
    <ConfigCard
      title="Networks"
      subtitle="Required networks will ensure that users connect at least 1 wallet of that type when logging in."
    >
      <>
        <FormField
          control={form.control}
          name="supportedWalletTypes"
          render={({ field: { ref: _, value, onChange, disabled } }) => (
            <FormItem className="para:flex-1">
              <div className="para:flex para:flex-col para:gap-4">
                {WALLET_TYPES.map(type => {
                  const config = WALLET_TYPE_CONFIG[type];
                  const valIndex = value?.findIndex(v => v.type === type) ?? -1;
                  const _value = valIndex !== -1 ? value?.[valIndex] : undefined;
                  const isSelected = !!_value;
                  const isRequired = isSelected && !_value?.optional;
                  return (
                    <FlatCard key={type} className="para:p-4">
                      <div className="para:flex para:flex-col para:md:flex-row para:items-center para:justify-between para:gap-4">
                        <div className="para:flex para:self-start para:md:self-auto  para:gap-4 para:items-center">
                          <Switch
                            checked={isSelected}
                            onCheckedChange={checked => {
                              let newVal = value ?? [];
                              if (checked) {
                                newVal = [...newVal, { type, optional: false }];
                              } else {
                                newVal = newVal.filter(v => v.type !== type);
                              }

                              onChange(newVal);
                            }}
                            disabled={disabled}
                          />
                          <div className="para:flex para:items-center para:gap-2">
                            {config.Icon}
                            <Typography className="para:font-medium">{config.name}</Typography>
                          </div>
                        </div>
                        <div className="para:flex para:self-start para:md:self-auto para:gap-2 para:items-center">
                          <Checkbox
                            id={`${type}-checkbox`}
                            checked={isRequired}
                            onCheckedChange={checked => {
                              let newVal = value ?? [];
                              if (valIndex !== -1) {
                                newVal.splice(valIndex, 1, { type, optional: !checked });
                              }
                              onChange(newVal);
                            }}
                            disabled={disabled || !isSelected}
                          />
                          <Label htmlFor={`${type}-checkbox`} className="para:text-sm para:font-medium">
                            Required
                          </Label>
                        </div>
                      </div>
                    </FlatCard>
                  );
                })}
              </div>
            </FormItem>
          )}
        />
      </>
    </ConfigCard>
  );
};
