import { FlatCard } from '../../../components/FlatCard';
import { ConfigCardContent, ConfigCardContentProps } from './ConfigCardContent';

export const ConfigCard = (props: ConfigCardContentProps) => {
  return (
    <FlatCard className="para:border-section-border">
      <ConfigCardContent {...props} />
    </FlatCard>
  );
};
