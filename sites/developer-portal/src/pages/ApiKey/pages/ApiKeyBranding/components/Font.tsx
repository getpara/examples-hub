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
import { FormControl, FormMessage } from '../../../../../components/formComponents';
import { ADVANCED_MODAL_THEME_DOCS_LINK, EMAIL_FONTS } from '../../../../../utils/constants';
import { ConfigCard } from '../../../components/ConfigCard';
import { BrandingForm } from '../hooks/useBrandingForm';
import { InfoAlert } from '../../../../../components/InfoAlert';
import { Link } from 'react-router-dom';

export const Font = () => {
  const form = useFormContext<BrandingForm>();

  return (
    <ConfigCard title="Font">
      <div className="para:flex para:flex-col para:gap-4 para:flex-1">
        <FormField
          control={form.control}
          name="font"
          render={({ field: { ref: ref, ...restField } }) => (
            <FormItem className="para:flex-1">
              <FormLabel>Choose Font</FormLabel>
              <Select {...restField} value={restField.value ?? undefined} onValueChange={restField.onChange}>
                <FormControl>
                  <SelectTrigger className="para:w-full" style={{ fontFamily: restField.value ?? undefined }}>
                    <SelectValue placeholder="Select Font" ref={ref} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EMAIL_FONTS.map(o => (
                    <SelectItem key={o} value={o} style={{ fontFamily: o }}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <InfoAlert
          className="para:w-full"
          title="Custom Fonts"
          content={
            <span>
              Custom fonts can be used in the Para Modal.{' '}
              <Link to={ADVANCED_MODAL_THEME_DOCS_LINK} target="_blank" className="para:underline">
                Learn More
              </Link>
            </span>
          }
        />
      </div>
    </ConfigCard>
  );
};
