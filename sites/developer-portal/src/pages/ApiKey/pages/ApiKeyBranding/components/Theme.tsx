import {
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
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { BrandingForm } from '../hooks/useBrandingForm';
import { ColorInput } from '../../../../../components/ColorInput';
import { THEME_MODES } from '../../../../../utils/constants';

export const Theme = () => {
  const form = useFormContext<BrandingForm>();

  return (
    <ConfigCard title="Theme">
      <div className="para:flex para:flex-col para:gap-4 para:flex-1">
        <div className="para:flex para:flex-col para:lg:flex-row para:gap-4 para:flex-1">
          <FormField
            control={form.control}
            name="backgroundColor"
            render={({ field: { ref: _, ...restField } }) => (
              <FormItem className="para:flex-1">
                <FormLabel>Primary</FormLabel>
                <FormControl>
                  <ColorInput {...restField} value={restField.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="foregroundColor"
            render={({ field: { ref: _, ...restField } }) => (
              <FormItem className="para:flex-1">
                <FormLabel>Secondary</FormLabel>
                <FormControl>
                  <ColorInput {...restField} value={restField.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="accentColor"
            render={({ field: { ref: _, ...restField } }) => (
              <FormItem className="para:flex-1">
                <FormLabel>{'Accent (Optional)'}</FormLabel>
                <FormControl>
                  <ColorInput {...restField} value={restField.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="themeMode"
          render={({ field: { ref: ref, ...restField } }) => (
            <FormItem className="para:w-full para:lg:w-[200px]">
              <FormLabel>Theme</FormLabel>
              <Select {...restField} value={restField.value ?? ''} onValueChange={restField.onChange}>
                <FormControl>
                  <SelectTrigger className="para:w-full">
                    <SelectValue placeholder="Select Theme" ref={ref} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {THEME_MODES.map(o => (
                    <SelectItem key={o} value={o.toUpperCase()}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </ConfigCard>
  );
};
