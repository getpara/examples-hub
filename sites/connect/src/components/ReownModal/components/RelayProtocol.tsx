import { Typography } from '@getpara/react-component-library';
import { Section } from './Section';

type RelayProtocolProps = { protocol?: string };

export const RelayProtocol = ({ protocol }: RelayProtocolProps) => {
  return (
    <Section label="Relay Protocol">
      <Typography color="secondary" className="para:text-sm para:font-semibold">
        {protocol}
      </Typography>
    </Section>
  );
};
