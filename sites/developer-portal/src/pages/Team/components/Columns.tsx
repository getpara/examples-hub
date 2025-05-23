import { ColumnDef } from '@tanstack/react-table';
import { Badge, cn, Skeleton } from '@getpara/react-component-library';
import { OrganizationMember, Project } from '../../../types/api';
import { formatDate } from '../../../utils/formatDate';
import { formatRole } from '../../../utils/organizationMemberHelpers';

const baseSkeleton = 'para:h-3.5 para:w-2xs para:rounded para:bg-foreground/10';

export const getColumns = (isLoading?: boolean): ColumnDef<OrganizationMember>[] => {
  return [
    {
      accessorFn: d => d.user?.name ?? '',
      header: 'Name',
      ...(isLoading && {
        cell: () => <Skeleton className={baseSkeleton} />,
      }),
    },
    {
      accessorFn: d => d.user?.email ?? d.pendingEmail ?? '',
      header: 'Email',
      ...(isLoading && {
        cell: () => <Skeleton className={baseSkeleton} />,
      }),
    },
    {
      accessorFn: d => (d.joinedAt ? formatDate(d.joinedAt) : 'Invited'),
      header: 'Date Joined',
      ...(isLoading && {
        cell: () => <Skeleton className={cn(baseSkeleton, 'para:w-24')} />,
      }),
    },
    {
      accessorFn: d => formatRole(d.role),
      header: 'Role',
      ...(isLoading && {
        cell: () => <Skeleton className={cn(baseSkeleton, 'para:w-24')} />,
      }),
    },
    {
      accessorKey: 'projects',
      header: 'Project Access',
      cell: isLoading
        ? () => <Skeleton className={cn(baseSkeleton, 'para:w-24 para:h-[22px] para:ml-auto')} />
        : ({ row }) => {
            const role = row.original.role;

            if (role === 'ORG_MEMBER' || role === 'ORG_OWNER') {
              return 'All';
            }

            const projects = row.getValue<Project[]>('projects');

            if (!projects?.length) {
              return 'None';
            }

            const shownProjects = projects.slice(0, 2);
            const numRemainingProjects = projects.length - 2;

            return (
              <div className="para:flex para:flex-wrap para:gap-1">
                {shownProjects.map(project => (
                  <Badge className="para:font-semibold" variant="outline" key={project.id}>
                    {project.name}
                  </Badge>
                ))}
                {numRemainingProjects > 0 && (
                  <div className="para:basis-auto para:w-full para:flex">
                    <Badge className="para:font-semibold" variant="outline">{`+${numRemainingProjects} More`}</Badge>
                  </div>
                )}
              </div>
            );
          },
    },
  ];
};
