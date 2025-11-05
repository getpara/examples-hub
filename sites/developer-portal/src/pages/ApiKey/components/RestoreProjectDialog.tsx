import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
  Typography,
} from '@getpara/react-component-library';
import { Link, useParams } from 'react-router-dom';
import { useGetProject } from '../../../hooks/api/queries/useProjects';
import { useArchiveProject } from '../../../hooks/api/mutations/useArchiveProject';
import { useRestoreProject } from '../../../hooks/api/mutations/useRestoreProject';
import { usePlan } from '../../../hooks/api/queries/usePlans';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { useState } from 'react';
import { ArchiveProjectList } from '../../../components/ArchiveProjectList';

type RestoreProjectDialogProps = {
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
};

export const RestoreProjectDialog = ({ isOpen, setIsOpen }: RestoreProjectDialogProps) => {
  const { organizationId, projectId } = useParams();
  const { data: project } = useGetProject(projectId ?? '');
  const { mutateAsync: archiveProject, isPending: isArchivingProject } = useArchiveProject();
  const { mutate: restoreProject, isPending: isRestoringProject } = useRestoreProject();
  const { data: subscription } = useGetOrganizationSubscription();
  const { data: plan } = usePlan(subscription?.plan.slug ?? '');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const planMaxProjects = plan?.maxProjects ?? 1;

  const handleConfirmClick = async () => {
    if (project) {
      try {
        if (selectedProjectIds.length > 0) {
          const promises = selectedProjectIds.map(id => archiveProject({ projectId: id }));

          await Promise.all(promises);
        }

        restoreProject(
          { projectId: project.id },
          {
            onSuccess: () => setIsOpen(false),
            onError: () => {
              toast.error(`Failed to Restore Project`, {
                description: 'Please try again. If the problem persists, contact Para support.',
              });
            },
          },
        );
      } catch {
        toast.error('Failed to archive projects', {
          description: 'Please try again. If the problem persists, contact Para support.',
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore Project</DialogTitle>
          <DialogDescription>
            Your plan only supports {planMaxProjects} projects. Upgrade your plan or archive other projects.
          </DialogDescription>
          <Link to={`/${organizationId}/billing`}>
            <Button>Upgrade Plan</Button>
          </Link>
          <Typography className="para:font-semibold">Archive Projects</Typography>
          <Typography className="para:text-sm" color="muted">
            Archive 1 project
          </Typography>
          <ArchiveProjectList selectedProjectIds={selectedProjectIds} setSelectedProjectIds={setSelectedProjectIds} />
        </DialogHeader>
        <DialogFooter>
          <Button
            onClick={handleConfirmClick}
            disabled={isArchivingProject || isRestoringProject}
            isLoading={isArchivingProject || isRestoringProject}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
