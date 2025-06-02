import { Typography } from '@getpara/react-component-library';
import { Trans, useTranslation } from 'react-i18next';
import { pluralize } from '../../../utils/pluralize';
import { Plan } from '../../../types/api';
import { useGetAllActiveProjects } from '../../../hooks/api/queries/useProjects';
import { ArchiveProjectList } from '../../../components/ArchiveProjectList';

type ChangePlanDialogProjectArchiveProps = {
  plan?: Plan;
  planName: string;
  selectedProjectIds: string[];
  setSelectedProjectIds: (_: string[]) => void;
};

export const ChangePlanDialogProjectArchive = ({
  plan,
  planName,
  selectedProjectIds,
  setSelectedProjectIds,
}: ChangePlanDialogProjectArchiveProps) => {
  const { t } = useTranslation(['billing']);
  const { data: allActiveProjects } = useGetAllActiveProjects();

  const planMaxProjects = plan?.maxProjects ?? 1;

  if ((allActiveProjects?.length ?? 0) <= planMaxProjects) {
    return null;
  }

  return (
    <>
      <Typography className="para:font-semibold">{t('changePlanDialog.archiveProjects.title')}</Typography>
      <Typography className="para:inline para:text-sm" color="muted">
        <Trans
          t={t}
          i18nKey="changePlanDialog.archiveProjects.description"
          values={{ planName, projectCount: `${planMaxProjects} ${pluralize(planMaxProjects, 'project')}` }}
          components={{ bold: <strong /> }}
        />
      </Typography>
      <ArchiveProjectList selectedProjectIds={selectedProjectIds} setSelectedProjectIds={setSelectedProjectIds} />
    </>
  );
};
