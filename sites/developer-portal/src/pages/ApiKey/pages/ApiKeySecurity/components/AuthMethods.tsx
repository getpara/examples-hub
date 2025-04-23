import { Button, FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AUTH_METHODS, DOCS_LINK } from '../../../../../utils/constants';
import { SwitchCard } from '../../../components/SwitchCard';

export const AuthMethods = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="Passkeys and Passwords"
      subtitle="You can prompt users to create accounts using a passkey, a password, or let them choose. Enabling both the passkeys and passwords will allow the user to choose their method and Passkeys will be preferenced."
      ActionComponent={
        <Button>
          <Link to={DOCS_LINK} className="para:flex para:gap-2 para:items-center">
            Learn More
            <ArrowRight />
          </Link>
        </Button>
      }
    >
      <>
        {AUTH_METHODS.map(method => (
          <FormField
            key={method.value}
            control={form.control}
            name="supportedAuthMethods"
            render={({ field: { ref: _, onChange, value, disabled } }) => (
              <FormItem className="para:flex-1">
                <FormControl>
                  <SwitchCard
                    disabled={disabled}
                    onCheckedChange={checked => {
                      let newVal = value ?? [];
                      if (checked) {
                        newVal = [...newVal, method.value];
                      } else {
                        newVal = newVal.filter(v => v !== method.value);
                      }

                      onChange(newVal);
                    }}
                    label={method.label}
                    checked={value?.includes(method.value)}
                    value={undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </>
    </ConfigCard>
  );
};
