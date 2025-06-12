import { Button, FormField, FormItem, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TX_POPUPS_DOCS_LINK } from '../../../../../utils/constants';
import { SwitchCard } from '../../../components/SwitchCard';

export const TransactionPopups = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="Transaction Pop-ups"
      subtitle="Control if you want users to manually confirm transactions via a pop-up window."
      ActionComponent={
        <Link to={TX_POPUPS_DOCS_LINK} className="para:flex para:gap-2 para:items-center">
          <Button variant="outline">
            Learn More
            <ArrowRight />
          </Button>
        </Link>
      }
    >
      <FormField
        control={form.control}
        name="forceTransactionPopups"
        render={({ field: { ref: _, onChange, value, disabled } }) => (
          <FormItem className="para:flex-1">
            <FormControl>
              <SwitchCard
                disabled={disabled}
                onCheckedChange={onChange}
                label="Status"
                checked={!!value}
                value={undefined}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
