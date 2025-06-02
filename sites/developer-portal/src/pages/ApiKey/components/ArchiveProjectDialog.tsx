import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from '@getpara/react-component-library';
import { useParams } from 'react-router-dom';
import { useGetProject } from '../../../hooks/api/queries/useProjects';
import { useArchiveProject } from '../../../hooks/api/mutations/useArchiveProject';

type ArchiveProjectDialogProps = {
  isOpen: boolean;
  setIsOpen: (_: boolean) => void;
};

export const ArchiveProjectDialog = ({ isOpen, setIsOpen }: ArchiveProjectDialogProps) => {
  const { projectId } = useParams();
  const { data: project } = useGetProject(projectId ?? '');
  const { mutate: archiveProject, isPending: isArchivingProject } = useArchiveProject();

  const handleConfirmClick = () => {
    if (project) {
      archiveProject(
        { projectId: project.id },
        {
          onSuccess: () => setIsOpen(false),
          onError: () => {
            toast.error('Failed to Archive Project', {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive Project</DialogTitle>
          <DialogDescription>
            This will archive your project and suspend both your Development Keys and your Production Keys. You can always
            unarchive your project later.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleConfirmClick} disabled={isArchivingProject} isLoading={isArchivingProject}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
