import { FormField, FormItem, RadioGroup, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { RadioGroupItem } from '../../../components/RadioGroupItem';

// We currently don't configure 2FA on the api key, this component is ready ready once we do.

export const TwoFactorAuth = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard title="2 Factor Authentication" subtitle="Control if your users will be required to turn on 2FA.">
      <FormField
        control={form.control}
        // TODO: change the following value to the correct once 2FA is configured on the api key
        name="forceTransactionPopups"
        render={({ field: _ }) => (
          <FormItem className="para:flex-1">
            <FormControl>
              <RadioGroup
                // {...field}
                value="optional"
                className="para:gap-4"
              >
                <RadioGroupItem
                  value="off"
                  label="2FA Off"
                  subLabel="Users will not be prompted to turn on 2FA during account creation."
                />
                <RadioGroupItem
                  value="optional"
                  label="2FA Optional"
                  subLabel="Users will be prompted to turn on 2FA but will be able to skip it."
                />
                <RadioGroupItem
                  value="none"
                  label="2FA On"
                  subLabel="Users will be required to turn on 2FA before they can finish onboarding."
                />
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
