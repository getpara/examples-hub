import { Project } from '../../../types/api';
import { useProjectTotalUsersCount } from '../../../hooks/api/queries/useProjectTotalUsersCount';
import { truncateNumber } from '../../../utils/formatNumber';
import { Link, useParams } from 'react-router-dom';
import { FlatCard } from '../../../components/common';
import { Badge, Typography } from '@getpara/react-component-library';
import { OrganizationAvatar } from '../../../components/OgranizationAvatar';
import { formatFrameworkName, getFrameworkColors, getFrameworkIcon } from '../../../utils/framework';
import { Framework } from '../../../types/framework';
import clsx from 'clsx';

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
      <FlatCard className="para:h-full para:w-full">
        <div className="para:flex para:flex-col para:gap-4 para:h-full">
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
              <Badge variant="outline" className={clsx(frameworkColors?.bg, frameworkColors?.border)}>
                {Icon && <Icon className="para:size-3" />}
                {formatFrameworkName(project.framework as Framework)}
              </Badge>
            )}
          </div>
          <div className="para:flex para:mt-auto">
            <Typography className="para:text-xs para:font-medium" color="muted">
              {totalUsers !== undefined ? truncateNumber(totalUsers) : '--'} Users
            </Typography>
          </div>
        </div>
      </FlatCard>
    </Link>
  );
};
