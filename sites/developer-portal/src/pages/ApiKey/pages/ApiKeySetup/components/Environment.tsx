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
import { FRAMEWORK_OPTIONS } from '../../../../../utils/constants';
import { formatFrameworkName, getFrameworkIcon, getFrameworkPackageManagers } from '../../../../../utils/framework';
import { formatPackageManagerName, getPackageManagerIcon } from '../../../../../utils/packageManager';
import { ConfigCard } from '../../../components/ConfigCard';
import { SetupForm } from '../hooks/useSetupForm';
import { Framework } from '../../../../../types/framework';
import { PackageManager } from '../../../../../types/packageManager';

export const Environment = () => {
  const form = useFormContext<SetupForm>();

  const [framework, packageManager] = form.watch(['framework', 'packageManager']);
  const frameworkOptions = getFrameworkPackageManagers(framework as Framework);

  return (
    <ConfigCard title="Environment">
      <>
        <FormField
          control={form.control}
          name="framework"
          render={({ field: { ref: ref, ...restField } }) => (
            <FormItem className="para:flex-1 para:md:max-w-1/4">
              <FormLabel>Framework</FormLabel>
              <Select
                {...restField}
                value={restField.value ?? undefined}
                onValueChange={val => {
                  const newPMOptions = getFrameworkPackageManagers(val as Framework);

                  if (!newPMOptions.includes(packageManager as PackageManager)) {
                    form.setValue('packageManager', newPMOptions[0]);
                  }

                  restField.onChange(val);
                }}
              >
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
        {!!frameworkOptions?.length && (
          <FormField
            control={form.control}
            name="packageManager"
            render={({ field: { ref: ref, ...restField } }) => (
              <FormItem className="para:flex-1 para:md:max-w-1/4">
                <FormLabel>Package Manager</FormLabel>
                <Select {...restField} value={restField.value ?? undefined} onValueChange={restField.onChange}>
                  <FormControl>
                    <SelectTrigger className="para:w-full">
                      <SelectValue placeholder="Select Package Manager" ref={ref} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frameworkOptions.map(o => {
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
        )}
      </>
    </ConfigCard>
  );
};
