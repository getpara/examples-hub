import { FlatCard } from '../../../../../components/FlatCard';
import { SetupGuide } from './SetupGuide';

export const SideCard = () => {
  return (
    <div>
      <FlatCard className="para:p-6 para:xl:w-[var(--side-card-width)] para-h-full para:gap-4">
        <SetupGuide />
      </FlatCard>
    </div>
  );
};
