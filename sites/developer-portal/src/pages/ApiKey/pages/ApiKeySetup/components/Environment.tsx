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
import { FormControl } from '../../../../../components/formComponents';
import { FRAMEWORK_OPTIONS, PACKAGE_MANAGER_OPTIONS } from '../../../../../utils/constants';
import { formatFrameworkName, getFrameworkIcon } from '../../../../../utils/framework';
import { formatPackageManagerName, getPackageManagerIcon } from '../../../../../utils/packageManager';
import { ConfigCard } from '../../../components/ConfigCard';
import { SetupForm } from '../hooks/useSetupForm';

export const Environment = () => {
  const form = useFormContext<SetupForm>();

  return (
    <ConfigCard title="Environment">
      <>
        <FormField
          control={form.control}
          name="framework"
          render={({ field: { ref: ref, ...restField } }) => (
            <FormItem className="para:flex-1">
              <FormLabel>Framework</FormLabel>
              <Select {...restField} value={restField.value ?? undefined} onValueChange={restField.onChange}>
                <FormControl>
                  <SelectTrigger className="para:w-full">
                    <SelectValue placeholder="Select Framework" ref={ref} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FRAMEWORK_OPTIONS.map(o => {
                    const Icon = getFrameworkIcon(o);

                    return (
                      <SelectItem key={o} value={o}>
                        {Icon && <Icon className="para:size-4" />}
                        {formatFrameworkName(o)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="packageManager"
          render={({ field: { ref: ref, ...restField } }) => (
            <FormItem className="para:flex-1">
              <FormLabel>Package Manager</FormLabel>
              <Select {...restField} value={restField.value ?? undefined} onValueChange={restField.onChange}>
                <FormControl>
                  <SelectTrigger className="para:w-full">
                    <SelectValue placeholder="Select Package Manager" ref={ref} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PACKAGE_MANAGER_OPTIONS.map(o => {
                    const Icon = getPackageManagerIcon(o);

                    return (
                      <SelectItem key={o} value={o}>
                        {Icon && <Icon className="para:size-4" />}
                        {formatPackageManagerName(o)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </>
    </ConfigCard>
  );
};
