import { Button, Typography } from '@getpara/react-component-library';
import { FlatCard } from '../../../components/common';
import { ArrowRight } from 'lucide-react';
import bgImage from '../assets/cta-bg.png';
import { useCreateProjectAndKey } from '../../../hooks/useCreateProjectAndKey';
import { useCanCreateProject } from '../../../hooks/subscriptionGating/useCanCreateProject';
import { useOrganizationMemberCapabilities } from '../../../hooks/api/queries/useOrganizationMember';

export const CTACard = () => {
  const createProjectAndKey = useCreateProjectAndKey();
  const { canCreateProject } = useCanCreateProject();
  const { data: capabilities } = useOrganizationMemberCapabilities();

  return (
    <FlatCard className="para:relative para:h-[275px] para:w-full para:items-center para:justify-center para:overflow-hidden para:border-0">
      <div className="para:absolute para:w-full para:h-full para:p-0 para:flex para:top-0">
        <img src={bgImage} className="para:w-full para:h-full para:object-cover" />
      </div>
      <div className="para:z-10 para:flex para:flex-col para:items-center para:justify-center para:gap-6">
        <div className="para:flex para:flex-col para:gap-1">
          <Typography className="para:text-center para:text-primary-foreground para:text-4xl para:font-semibold">
            Ready to get started?
          </Typography>
          <Typography className="para:text-center para:text-primary-foreground para:font-medium">
            Let’s create your first project.
          </Typography>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="para:w-[166px]"
          onClick={createProjectAndKey}
          disabled={!canCreateProject || !capabilities?.canCreateProjects}
        >
          Get Started
          <ArrowRight />
        </Button>
      </div>
    </FlatCard>
  );
};
