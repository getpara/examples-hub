import { Button, FormField, FormItem, Typography, useFormContext } from '@getpara/react-component-library';
import { FormControl } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AUTH_METHODS, AUTH_METHODS_DOCS_LINK } from '../../../../../utils/constants';
import { SwitchCard } from '../../../components/SwitchCard';

export const AuthMethods = () => {
  const form = useFormContext<SecurityForm>();

  const { errors } = form.formState;
  const error = errors.supportedAuthMethods?.message;

  return (
    <ConfigCard
      title="Passkeys and Passwords"
      subtitle="You can prompt users to create accounts using a passkey, a password, or let them choose. Enabling both the passkeys and passwords will allow the user to choose their method and Passkeys will be preferenced."
      ActionComponent={
        <Link to={AUTH_METHODS_DOCS_LINK} className="para:flex para:gap-2 para:items-center">
          <Button variant="outline">
            Learn More
            <ArrowRight />
          </Button>
        </Link>
      }
      className="para:md:flex-col para:gap-1"
    >
      <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
        {AUTH_METHODS.map(method => (
          <FormField
            key={method.value}
            control={form.control}
            name="supportedAuthMethods"
            render={({ field: { ref: _, onChange, value, disabled } }) => (
              <FormItem className="para:flex-1 para:h-full">
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
              </FormItem>
            )}
          />
        ))}
      </div>
      {error && (
        <Typography color="destructive" className="para:text-xs para:text-destructive">
          {error}
        </Typography>
      )}
    </ConfigCard>
  );
};
