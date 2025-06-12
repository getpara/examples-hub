import { Copy } from 'lucide-react';
import { CopyToDialog } from './CopyToDialog';
import { useState } from 'react';
import { Button, toast, useFormContext } from '@getpara/react-component-library';
import { Archive } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useGetAllActiveProjects, useGetProject } from '../../../hooks/api/queries/useProjects';
import { ArchiveProjectDialog } from './ArchiveProjectDialog';
import { useRestoreProject } from '../../../hooks/api/mutations/useRestoreProject';
import { useGetOrganizationSubscription } from '../../../hooks/api/queries/useOrganizationSubscription';
import { usePlan } from '../../../hooks/api/queries/usePlans';
import { RestoreProjectDialog } from './RestoreProjectDialog';
import { useIsInView } from '../../../hooks/useIsInView';
import { useAppStore } from '../../../stores/app/useAppStore';
import { FloatingSaveButton } from './FloatingSaveButton';

type SettingsHeaderActionProps = {
  isSetup?: boolean;
};

export const SettingsHeaderAction = ({ isSetup }: SettingsHeaderActionProps) => {
  const { projectId } = useParams();
  const { data: subscription, isLoading: isLoadingSub } = useGetOrganizationSubscription();
  const { data: plan, isLoading: isLoadingPlan } = usePlan(subscription?.plan.slug ?? '');
  const { data: allActiveProjects, isLoading: isLoadingProjects } = useGetAllActiveProjects();
  const { data: project } = useGetProject(projectId ?? '');
  const { mutate: restoreProject, isPending: isRestoringProject } = useRestoreProject();
  const form = useFormContext();
  const [isCopyToDialogOpen, setIsCopyToDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const appBarHeight = useAppStore(state => state.appBarHeight);

  const { ref, isInView } = useIsInView<HTMLDivElement>({ rootMargin: `-${appBarHeight}px 0px 0px 0px` });

  const planMaxProjects = plan?.maxProjects ?? 1;
  const archiveButtonDisabled = isLoadingSub || isLoadingPlan || isLoadingProjects || isRestoringProject;

  const handleToggleArchiveClick = () => {
    if (project?.archived) {
      if ((allActiveProjects?.length ?? 0) >= planMaxProjects) {
        setRestoreDialogOpen(true);
        return;
      }
      restoreProject(
        { projectId: project.id },
        {
          onError: () => {
            toast.error(`Failed to Restore Project`, {
              description: 'Please try again. If the problem persists, contact Para support.',
            });
          },
        },
      );
      return;
    }

    setArchiveDialogOpen(true);
  };

  const { isDirty, isValid, disabled, isSubmitting } = form.formState;
  const canSave = isDirty && isValid && !disabled;

  const handleCopyToClick = () => {
    setIsCopyToDialogOpen(true);
  };

  return (
    <>
      <div ref={ref} className="para:flex para:gap-2 para:flex-wrap">
        <Button variant="outline" onClick={handleCopyToClick}>
          <Copy />
          Copy to
        </Button>
        {isSetup && (
          <Button
            variant={project?.archived ? 'neutral' : 'outline'}
            onClick={handleToggleArchiveClick}
            disabled={archiveButtonDisabled}
            isLoading={isRestoringProject}
          >
            {!project?.archived && <Archive />}
            {project?.archived ? 'Restore' : 'Archive'} Project
          </Button>
        )}
        {!project?.archived && (
          <Button variant="neutral" disabled={!canSave || isSubmitting} isLoading={isSubmitting} type="submit">
            Save Changes
          </Button>
        )}
      </div>
      <CopyToDialog open={isCopyToDialogOpen} setIsOpen={setIsCopyToDialogOpen} />
      <ArchiveProjectDialog isOpen={isArchiveDialogOpen} setIsOpen={setArchiveDialogOpen} />
      <RestoreProjectDialog isOpen={isRestoreDialogOpen} setIsOpen={setRestoreDialogOpen} />
      <FloatingSaveButton shouldShow={!isInView} />
    </>
  );
};
