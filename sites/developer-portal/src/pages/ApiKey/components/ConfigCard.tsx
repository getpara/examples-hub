import { FlatCard } from '../../../components/FlatCard';
import { ConfigCardContent, ConfigCardContentProps } from './ConfigCardContent';

type ConfigCardProps = { id?: string } & ConfigCardContentProps;

export const ConfigCard = ({ id, ...rest }: ConfigCardProps) => {
  return (
    <FlatCard id={id} className="para:border-section-border">
      <ConfigCardContent {...rest} />
    </FlatCard>
  );
};
