import { Button, Loader, Typography } from '@getpara/react-component-library';
import { useGetAllProjects } from '../../../hooks/api/queries/useProjects';
import { pluralize } from '../../../utils/pluralize';
import { triggerToast } from '../../../utils/toasts';
import { ProjectCard } from './ProjectCard';
import { CreateProjectButton } from './CreateProjectButton';

const SHOW_ALL_THRESHOLD = 6;

type ProjectsProps = {
  onShowAllClick: () => void;
};

export const Projects = ({ onShowAllClick }: ProjectsProps) => {
  const { data: projects, isLoading: isLoadingProjects, error: projectsError } = useGetAllProjects();

  if (projectsError) {
    triggerToast({
      variant: 'error',
      title: 'Error Loading Projects',
      body: 'Please try to login again. If the problem persists, contact Para support.',
    });
  }

  if (isLoadingProjects) {
    return <Loader />;
  }

  if (!projects) {
    return null;
  }

  const first6Projects = projects.slice(0, SHOW_ALL_THRESHOLD);

  return (
    <div className="para:flex para:flex-col para:gap-2 para:pb-6">
      <div className="para:flex para:items-center para:gap-2 para:justify-between">
        <div className="para:flex para:items-center para:gap-2">
          <Typography className="para:text-2xl para:font-semibold">
            {projects.length} {pluralize(projects.length, 'Project')}
          </Typography>
          {projects.length > SHOW_ALL_THRESHOLD && (
            <Button variant="outline" onClick={onShowAllClick} className="para:px-3">
              See All
            </Button>
          )}
        </div>
        <CreateProjectButton />
      </div>
      <div className="para:grid para:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] para:gap-2">
        {first6Projects?.map(project => <ProjectCard key={project.id} project={project} />)}
      </div>
    </div>
  );
};
