import { CTACard } from './CTACard';
import { EmptyStateReferences } from './EmptyStateReferences';
import { MigrationCTA } from './MigrationCTA';
import { TeammateCTA } from './TeammateCTA';

export const EmptyState = () => {
  return (
    <div className="para:flex para:flex-col para:gap-4 para:h-full para:w-full">
      <CTACard />
      <MigrationCTA />
      <TeammateCTA />
      <EmptyStateReferences />
    </div>
  );
};
