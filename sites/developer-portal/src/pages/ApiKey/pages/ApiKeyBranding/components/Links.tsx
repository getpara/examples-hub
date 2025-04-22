import { FormField, FormItem, FormLabel, Input, useFormContext } from '@getpara/react-component-library';
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ConfigCard } from '../../../components/ConfigCard';
import { BrandingForm } from '../hooks/useBrandingForm';

export const Links = () => {
  const form = useFormContext<BrandingForm>();

  return (
    <ConfigCard title="Links">
      <div className="para:flex-1 para:flex para:flex-col para:gap-4">
        <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
          <FormField
            control={form.control}
            name="homepageUrl"
            render={({ field }) => (
              <FormItem className="para:flex-1">
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? undefined} placeholder="https://www.acme.com" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="twitterUrl"
            render={({ field }) => (
              <FormItem className="para:flex-1">
                <FormLabel>X/Twitter Profile Link</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? undefined} placeholder="https://www.twitter.com/your-profile" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="para:flex para:flex-col para:md:flex-row para:gap-4">
          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem className="para:flex-1">
                <FormLabel>LinkedIn Profile Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? undefined}
                    placeholder="https://www.linkedin.com/company/your-profile"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="githubUrl"
            render={({ field }) => (
              <FormItem className="para:flex-1">
                <FormLabel>Github Profile Link</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={e => {
                      if (e.target.value === '') {
                        field.onChange(null);
                      } else {
                        field.onChange(e);
                      }
                    }}
                    value={field.value ?? undefined}
                    placeholder="https://www.github.com/your-profile"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </ConfigCard>
  );
};
