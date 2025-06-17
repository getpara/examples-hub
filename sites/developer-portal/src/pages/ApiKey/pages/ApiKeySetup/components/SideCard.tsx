import { FlatCard } from '../../../../../components/FlatCard';
import { SetupGuide } from './SetupGuide';

export const SideCard = () => {
  return (
    <div>
      <FlatCard className="para:p-3 para:lg:p-6 para:xl:w-[var(--side-card-width)] para-h-full para:gap-4 para:border-section-border">
        <SetupGuide />
      </FlatCard>
    </div>
  );
};
