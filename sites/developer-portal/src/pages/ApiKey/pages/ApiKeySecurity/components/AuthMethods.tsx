import { Button, FormField, FormItem, Typography, useFormContext } from '@getpara/react-component-library';
import { FormControl } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AUTH_METHODS, AUTH_METHODS_DOCS_LINK, SUPPORT_URL } from '../../../../../utils/constants';
import { SwitchCard } from '../../../components/SwitchCard';

export const AuthMethods = () => {
  const form = useFormContext<SecurityForm>();

  const selectedAuthMethods = form.watch('supportedAuthMethods');

  // This is temporary until basic login is publicly available
  const basicLoginAuthMethod = AUTH_METHODS[0];
  const isUsingBasicLogin = selectedAuthMethods?.includes('BASIC_LOGIN');
  const filteredAuthMethods = AUTH_METHODS.filter(m => m.value !== 'BASIC_LOGIN');

  const { errors } = form.formState;
  const error = errors.supportedAuthMethods?.message;

  return (
    <ConfigCard
      title="Passkey, Password, and PIN Settings"
      subtitle="You can prompt users to secure accounts using a passkey, password, or PIN. Enabling multiple options will allow the user to choose their method. At least one method must be selected"
      ActionComponent={
        <Link to={AUTH_METHODS_DOCS_LINK} className="para:flex para:gap-2 para:items-center">
          <Button variant="outline">
            Learn More
            <ArrowRight />
          </Button>
        </Link>
      }
      className="para:md:flex-col para:gap-4"
    >
      {isUsingBasicLogin && (
        <>
          <FormField
            key={basicLoginAuthMethod.value}
            control={form.control}
            name="supportedAuthMethods"
            render={({ field: { ref: _, onChange, value, disabled } }) => (
              <FormItem className="para:flex-1 para:h-full">
                <FormControl>
                  <SwitchCard
                    disabled={disabled || isUsingBasicLogin}
                    onCheckedChange={checked => {
                      let newVal = value ?? [];
                      if (checked) {
                        newVal = [...newVal, basicLoginAuthMethod.value];
                      } else {
                        newVal = newVal.filter(v => v !== basicLoginAuthMethod.value);
                      }

                      onChange(newVal);
                    }}
                    label={basicLoginAuthMethod.label}
                    checked={value?.includes(basicLoginAuthMethod.value)}
                    value={undefined}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Typography color="secondary" className="para:text-sm para:font-medium">
            Your account has basic login enabled. If you would like to turn it off,{' '}
            <Link className="para:underline" to={SUPPORT_URL}>
              Contact Us
            </Link>
            .
          </Typography>
        </>
      )}
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
                      disabled={disabled || isUsingBasicLogin}
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
