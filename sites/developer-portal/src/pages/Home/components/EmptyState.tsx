import { Typography } from '@getpara/react-component-library';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';
import { CTACard } from './CTACard';
import { EmptyStateReferences } from './EmptyStateReferences';
import { MigrationCTA } from './MigrationCTA';
import { TeammateCTA } from './TeammateCTA';
import { LogoCTA } from './LogoCTA';

export const EmptyState = () => {
  const { data: capabilities } = useOrganizationMemberCapabilities();

  if (!capabilities?.canCreateProjects) {
    return <Typography className="para:text-2xl para:font-semibold">No Available Projects</Typography>;
  }

  return (
    <div className="para:flex para:flex-col para:gap-4 para:h-full para:w-full">
      <CTACard />
      <LogoCTA />
      <MigrationCTA />
      <TeammateCTA />
      <EmptyStateReferences />
    </div>
  );
};
