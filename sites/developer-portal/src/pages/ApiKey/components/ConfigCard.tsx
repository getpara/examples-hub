import { FlatCard } from '../../../components/FlatCard';
import { ConfigCardContent, ConfigCardContentProps } from './ConfigCardContent';

export const ConfigCard = (props: ConfigCardContentProps) => {
  return (
    <FlatCard>
      <ConfigCardContent {...props} />
    </FlatCard>
  );
};
