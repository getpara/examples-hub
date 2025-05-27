import { Checkbox, Label, Typography } from '@getpara/react-component-library';
import { Trans, useTranslation } from 'react-i18next';
import { pluralize } from '../../../utils/pluralize';
import { Plan } from '../../../types/api';
import { useGetAllActiveProjects } from '../../../hooks/api/queries/useProjects';
import { FlatCard } from '../../../components/common';

type ChangePlanDialogProjectArchiveProps = {
  plan?: Plan;
  planName: string;
  remainingProjectIds: string[];
  setRemainingProjectIds: (_: string[]) => void;
};

export const ChangePlanDialogProjectArchive = ({
  plan,
  planName,
  remainingProjectIds,
  setRemainingProjectIds,
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
      {allActiveProjects?.map(project => (
        <FlatCard key={project.id} className="para:p-2 para:flex-row para:items-center para:justify-between">
          <Typography className="para:text-sm para:font-medium">{project.name}</Typography>
          <div className="para:flex para:gap-2 para:items-center">
            <Checkbox
              id={`${project.id}-checkbox`}
              checked={!remainingProjectIds.includes(project.id)}
              onCheckedChange={() => {
                let newVal = remainingProjectIds ?? [];

                if (remainingProjectIds.includes(project.id)) {
                  newVal = newVal.filter(id => id !== project.id);
                } else {
                  newVal = [...newVal, project.id];
                }
                setRemainingProjectIds(newVal);
              }}
            />
            <Label htmlFor={`${project.id}-checkbox`} className="para:text-sm para:font-medium">
              {t('changePlanDialog.archiveProjects.checkboxLabel')}
            </Label>
          </div>
        </FlatCard>
      ))}
    </>
  );
};
