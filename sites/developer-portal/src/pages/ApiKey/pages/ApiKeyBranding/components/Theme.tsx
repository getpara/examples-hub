import { FormField, FormItem, FormLabel, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { BrandingForm } from '../hooks/useBrandingForm';
import { ColorInput } from '../../../../../components/ColorInput';
import { getThemeModeFromColor } from '../../../../../utils/theme';

export const Theme = () => {
  const form = useFormContext<BrandingForm>();

  return (
    <ConfigCard title="Colors" subtitle="We recommend setting your Foreground color to your primary brand color.">
      <div className="para:flex para:flex-col para:gap-4 para:flex-1">
        <div className="para:flex para:flex-col para:lg:flex-row para:gap-4 para:flex-1">
          <FormField
            control={form.control}
            name="foregroundColor"
            render={({ field: { ref: _, ...restField } }) => (
              <FormItem className="para:flex-1 para:md:max-w-1/4">
                <FormLabel>Foreground</FormLabel>
                <FormControl>
                  <ColorInput {...restField} value={restField.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field: { ref: _, ...restField } }) => (
              <FormItem className="para:flex-1 para:md:max-w-1/4">
                <FormLabel>Background</FormLabel>
                <FormControl>
                  <ColorInput
                    {...restField}
                    value={restField.value ?? ''}
                    onChange={value => {
                      restField.onChange(value);

                      const newTheme = getThemeModeFromColor(value);

                      form.setValue('themeMode', newTheme, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field: { ref: _, ...restField } }) => (
              <FormItem className="para:flex-1 para:md:max-w-1/4">
                <FormLabel>{'Accent (Optional)'}</FormLabel>
                <FormControl>
                  <ColorInput {...restField} value={restField.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </ConfigCard>
  );
};
