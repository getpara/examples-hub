import { Button, FormField, FormItem, Typography, useFormContext } from '@getpara/react-component-library';
import { FormControl } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AUTH_METHODS, AUTH_METHODS_DOCS_LINK } from '../../../../../utils/constants';
import { SwitchCard } from '../../../components/SwitchCard';
import { AuthMethod } from '@getpara/user-management-client';

export const AuthMethods = () => {
  const form = useFormContext<SecurityForm>();

  const filteredAuthMethods = AUTH_METHODS.filter(m => m.value !== AuthMethod.BASIC_LOGIN);

  const { errors } = form.formState;
  const error = errors.supportedAuthMethods?.message;

  return (
    <ConfigCard
      title="Passkey, Password, and PIN Settings"
      subtitle={`Turning on any of these options will prompt users to add an additional authentication method to their account during account creation.\n\nUsers with previously created accounts or accounts created elsewhere will not be affected.\n\nEnabling both the passkeys and passwords will allow the user to choose their method and Passkeys will be preferenced to Passwords and PIN and PIN will preferenced to Passwords.`}
      ActionComponent={
        <Link
          to={AUTH_METHODS_DOCS_LINK}
          className="para:flex para:gap-2 para:items-center"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="outline">
            Learn More
            <ArrowRight />
          </Button>
        </Link>
      }
      className="para:md:flex-col para:gap-4"
    >
      <div className="para:flex para:flex-col para:gap-1">
        <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
          {filteredAuthMethods.map(method => (
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
      </div>
    </ConfigCard>
  );
};
