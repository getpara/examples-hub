import { Button, Loader, toast, Typography } from '@getpara/react-component-library';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';
import { ProjectCard } from './ProjectCard';
import { ChevronLeft } from 'lucide-react';
import { CreateProjectButton } from './CreateProjectButton';

type AllProjectsProps = {
  onBackClick: () => void;
};

export const AllProjects = ({ onBackClick }: AllProjectsProps) => {
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useGetAllProjects();

  if (projectsError) {
    toast.error('Error Loading Projects');
  }

  if (isLoadingProjects) {
    return <Loader />;
  }

  if (!projects) {
    return null;
  }

  return (
    <div className="para:flex para:flex-col para:gap-2">
      <div>
        <Button variant="ghost" onClick={onBackClick} className="para:px-0!">
          <ChevronLeft />
          Back
        </Button>
      </div>
      <div className="para:flex para:items-center para:gap-2 para:justify-between">
        <Typography className="para:text-2xl para:font-semibold">Projects</Typography>
        <CreateProjectButton />
      </div>
      <div className="para:grid para:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] para:gap-2">
        {projects?.map(project => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  );
};
