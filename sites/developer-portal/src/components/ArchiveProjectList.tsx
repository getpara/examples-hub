import { Checkbox, Label, Typography } from '@getpara/react-component-library';
import { useTranslation } from 'react-i18next';
import { useGetAllActiveProjects } from '../hooks/api/queries/useProjects';
import { FlatCard } from './FlatCard';

type ArchiveProjectListProps = {
  selectedProjectIds: string[];
  setSelectedProjectIds: (_: string[]) => void;
};

export const ArchiveProjectList = ({ selectedProjectIds, setSelectedProjectIds }: ArchiveProjectListProps) => {
  const { t } = useTranslation(['common']);
  const { data: allActiveProjects } = useGetAllActiveProjects();

  return (
    <>
      {allActiveProjects?.map(project => (
        <FlatCard key={project.id} className="para:p-2 para:flex-row para:items-center para:justify-between">
          <Typography className="para:text-sm para:font-medium">{project.name}</Typography>
          <div className="para:flex para:gap-2 para:items-center">
            <Checkbox
              id={`${project.id}-checkbox`}
              checked={selectedProjectIds.includes(project.id)}
              onCheckedChange={() => {
                let newVal = selectedProjectIds ?? [];

                if (selectedProjectIds.includes(project.id)) {
                  newVal = newVal.filter(id => id !== project.id);
                } else {
                  newVal = [...newVal, project.id];
                }
                setSelectedProjectIds(newVal);
              }}
            />
            <Label htmlFor={`${project.id}-checkbox`} className="para:text-sm para:font-medium">
              {t('archiveProjects.checkboxLabel')}
            </Label>
          </div>
        </FlatCard>
      ))}
    </>
  );
};
