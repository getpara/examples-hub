import { Separator, Typography } from '@getpara/react-component-library';
import { Section } from './Section';

type MethodsProps = { methods: string[] };

export const Methods = ({ methods }: MethodsProps) => {
  return (
    <>
      <Section label={methods.length === 1 ? 'Method' : 'Methods'}>
        <Typography color="secondary" className="para:text-sm para:font-semibold">
          {methods.join(', ')}
        </Typography>
      </Section>
      <Separator />
    </>
  );
};
