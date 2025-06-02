import { Project } from '../../../types/api';
import { useProjectTotalUsersCount } from '../../../hooks/api/queries/useProjectTotalUsersCount';
import { truncateNumber } from '../../../utils/formatNumber';
import { Link, useParams } from 'react-router-dom';
import { FlatCard } from '../../../components/common';
import { Badge, cn, Typography } from '@getpara/react-component-library';
import { OrganizationAvatar } from '../../../components/OrganizationAvatar';
import { formatFrameworkName, getFrameworkColors, getFrameworkIcon } from '../../../utils/framework';
import { Framework } from '../../../types/framework';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const { organizationId } = useParams();

  const { data: totalUsers } = useProjectTotalUsersCount(project.id);

  const Icon = getFrameworkIcon(project.framework as Framework);
  const frameworkColors = getFrameworkColors(project.framework as Framework);

  return (
    <Link to={`/${organizationId}/project/${project.id}/key`} className="para:h-[240px] para:min-w-[200px]">
      <FlatCard className="para:p-6 para:h-full para:w-full para:hover:shadow-md para:transition-shadow para:duration-200 para:ease-out para:group">
        <div className="para:flex para:flex-col para:gap-4 para:h-full para:justify-between">
          <div className="para:flex para:flex-col para:gap-4">
            <OrganizationAvatar
              className="para:size-6 para:rounded-sm para:bg-background"
              name={project.name}
              url={project.iconUrl}
            />
            <div className="para:flex para:flex-col para:gap-2">
              <Typography className="para:text-lg para:font-semibold">{project.name}</Typography>
              {project.description && (
                <Typography className="para:text-sm para:font-medium" color="secondary">
                  {project.description}
                </Typography>
              )}
              {project.framework && (
                <Badge variant="outline" className={cn(frameworkColors?.bg, frameworkColors?.border)}>
                  {Icon && <Icon className="para:size-3" />}
                  {formatFrameworkName(project.framework as Framework)}
                </Badge>
              )}
              {project.archived && (
                <Badge
                  variant="outline"
                  className="para:border-border para:bg-muted para:rounded-xs para:text-2xs para:font-medium para:uppercase para:hidden para:md:inline-flex"
                >
                  Archived
                </Badge>
              )}
            </div>
          </div>
          <div className="para:transition-all para:flex para:group-hover:opacity-100 para:opacity-100 para:md:opacity-0 para:group-hover:top-0 para:top-0 para:md:top-2 para:relative">
            <Typography className="para:text-xs para:font-medium" color="muted">
              {totalUsers !== undefined ? truncateNumber(totalUsers) : '--'} Users
            </Typography>
          </div>
        </div>
      </FlatCard>
    </Link>
  );
};
