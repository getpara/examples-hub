import { CpslInput, CpslText } from '@getpara/react-components';
import { InnerConfigurationCard } from '../InnerConfigurationCard';
import { useFormContext } from 'react-hook-form';
import { UpdateSessionLength } from '../../hooks/useSessionLengthConfigFormData';

const ONE_HOUR_MILLIS = 60 * 60 * 1000; // 60 minutes * 60 seconds * 1000 milliseconds

const TWO_HOURS_MILLIS = (2 * ONE_HOUR_MILLIS).toString();
const ONE_DAY_MILLIS = (24 * ONE_HOUR_MILLIS).toString();
const ONE_WEEK_MILLIS = (7 * 24 * ONE_HOUR_MILLIS).toString();
const ONE_MONTH_MILLIS = (30 * 24 * ONE_HOUR_MILLIS).toString();

export const SessionLength = () => {
  const { watch, setValue } = useFormContext<UpdateSessionLength>();

  const sessionMaxAge = watch('sessionMaxAge');

  const customLengthSelected =
    !!sessionMaxAge && ![TWO_HOURS_MILLIS, ONE_DAY_MILLIS, ONE_WEEK_MILLIS, ONE_MONTH_MILLIS].includes(sessionMaxAge);

  const customLengthDefaultValue = customLengthSelected ? parseInt(sessionMaxAge) / 60000 : undefined;

  return (
    <>
      <InnerConfigurationCard
        isSelectable
        isSelected={sessionMaxAge === TWO_HOURS_MILLIS || !sessionMaxAge}
        onSelect={() => setValue('sessionMaxAge', TWO_HOURS_MILLIS, { shouldDirty: true })}
      >
        <CpslText weight="semiBold">2 Hours</CpslText>
      </InnerConfigurationCard>
      <InnerConfigurationCard
        isSelectable
        isSelected={sessionMaxAge === ONE_DAY_MILLIS}
        onSelect={() => setValue('sessionMaxAge', ONE_DAY_MILLIS, { shouldDirty: true })}
      >
        <CpslText weight="semiBold">1 Day</CpslText>
      </InnerConfigurationCard>
      <InnerConfigurationCard
        isSelectable
        isSelected={sessionMaxAge === ONE_WEEK_MILLIS}
        onSelect={() => setValue('sessionMaxAge', ONE_WEEK_MILLIS, { shouldDirty: true })}
      >
        <CpslText weight="semiBold">1 Week</CpslText>
      </InnerConfigurationCard>
      <InnerConfigurationCard
        isSelectable
        isSelected={sessionMaxAge === ONE_MONTH_MILLIS}
        onSelect={() => setValue('sessionMaxAge', ONE_MONTH_MILLIS, { shouldDirty: true })}
      >
        <CpslText weight="semiBold">1 Month</CpslText>
      </InnerConfigurationCard>
      <InnerConfigurationCard isSelectable isSelected={customLengthSelected} onSelect={() => {}}>
        <CpslText weight="semiBold">Custom</CpslText>
        <CpslText color="secondary" variant="bodyS">
          Length in minutes
        </CpslText>
        <CpslInput
          placeholder="Length in minutes"
          value={customLengthDefaultValue?.toString()}
          onCpslInput={e => {
            if (!e.detail.value) {
              setValue('sessionMaxAge', '', { shouldDirty: true });
              return;
            }
            setValue('sessionMaxAge', (parseInt(e.detail.value) * 60000).toString(), { shouldDirty: true });
          }}
        ></CpslInput>
      </InnerConfigurationCard>
    </>
  );
};
