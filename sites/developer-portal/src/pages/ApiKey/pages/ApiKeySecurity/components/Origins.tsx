import { Button, FormField, FormItem, FormLabel, Textarea, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormDescription, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { SecurityForm } from '../hooks/useSecurityForm';
import { DOMAIN_SECURITY_DOCS_LINK } from '../../../../../utils/constants';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Origins = () => {
  const form = useFormContext<SecurityForm>();

  return (
    <ConfigCard
      title="Allowed Origins"
      subtitle="This is the list of domains that are able to make requests on your Para instance. By default all domains are allowed. We recommend adding the domain’s of the apps where you will be integrating Para."
      ActionComponent={
        <Link
          to={DOMAIN_SECURITY_DOCS_LINK}
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
    >
      <FormField
        control={form.control}
        name="origins"
        render={({ field }) => (
          <FormItem className="para:flex-1">
            <FormLabel>Origin URLs</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value ?? undefined}
                placeholder="e.g. https://www.origin-1.com, http://www.origin-2.com"
                className="para:resize-none para:h-[112px]"
              />
            </FormControl>
            <FormDescription>
              Domains must include the protocol (e.g. https://). Separate each domain by a comma.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </ConfigCard>
  );
};
