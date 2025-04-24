import { Button, FormField, FormItem, Input, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import clsx from 'clsx';
import { Cog } from 'lucide-react';

const BUTTONS = [
  {
    label: '2 Hours',
    value: 7_200_000,
  },
  {
    label: '1 Day',
    value: 86_400_000,
  },
  {
    label: '1 Week',
    value: 604_800_000,
  },
  {
    label: '1 Month',
    value: 2_592_000_000,
  },
  {
    label: 'Custom',
    value: -1,
  },
];

export const SessionLength = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="Session Length"
      subtitle="Configure how long a user session lasts. When a user session ends, the user will need to log back in."
    >
      <FormField
        control={form.control}
        name="sessionMaxAge"
        render={({ field, fieldState: { error } }) => (
          <FormItem className="para:flex-1">
            <FormControl>
              <div className="para:flex para:gap-1 para:flex-wrap">
                {BUTTONS.map(button => {
                  const isCustom = button.value === -1;
                  const isSelected = field.value === button.value;
                  const isAnotherSelected = !!BUTTONS.find(b => b.value === field.value);
                  return (
                    <div
                      className={clsx('para:flex para:gap-1', {
                        'para:flex-1': isCustom,
                      })}
                      key={button.value}
                    >
                      <Button
                        className="para:h-12"
                        variant={isSelected || (!isAnotherSelected && isCustom) ? 'default' : 'outline'}
                        onClick={() => {
                          if (isCustom) {
                            return;
                          }
                          field.onChange(button.value);
                        }}
                        disabled={field.disabled}
                      >
                        {isCustom && <Cog />}
                        {button.label}
                      </Button>
                      {isCustom && (
                        <Input
                          className="para:flex-1 para:min-w-[200px]"
                          {...field}
                          value={field.value ?? ''}
                          placeholder="Enter custom length in minutes"
                          type="number"
                          onChange={e => {
                            const val = e.target.value;
                            let numericVal: number | null = null;

                            if (val) {
                              numericVal = parseInt(val);
                            }

                            field.onChange(numericVal);
                          }}
                          aria-invalid={!!error}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
