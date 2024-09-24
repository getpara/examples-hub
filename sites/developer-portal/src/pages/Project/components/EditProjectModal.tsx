import { CpslButton, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { triggerToast } from '../../../utils/toasts';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { formatFrameworkName, formatPackageManagerName } from '../../../utils/project';
import { useUpdateProject } from '../../../hooks/api/mutations/useUpdateProject';
import { useParams } from 'react-router-dom';
import { useGetProject } from '../../../hooks/api/queries/useProjects';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const FRAMEWORK_OPTIONS: Framework[] = [Framework.REACT, Framework.REACT_NATIVE, Framework.VUE];

const PACKAGE_MANAGER_OPTIONS: PackageManager[] = [PackageManager.NPM, PackageManager.YARN, PackageManager.PNPM];

export const EditProjectModal = ({ open, onClose }: EditProjectModalProps) => {
  const { projectId } = useParams();
  const { data: project } = useGetProject(projectId ?? '');
  const { mutate: updateProject } = useUpdateProject();

  const DEFAULT_VALUES = {
    name: project?.name ?? '',
    framework: project?.framework ?? '',
    packageManager: project?.packageManager ?? '',
  };

  const {
    control,
    formState: { isValid },
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const [name, framework, packageManager] = useWatch({
    control,
    name: ['name', 'framework', 'packageManager'],
  });

  const handleSaveClick = () => {
    if (!projectId) {
      return;
    }

    updateProject(
      {
        projectId,
        data: { name, framework, packageManager },
      },
      {
        onSuccess: () => {
          onClose();
          triggerToast({
            variant: 'success',
            title: 'Project Updated!',
          });
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Failed to Update Project',
            body: 'Please try again. If the problem persists, contact Capsule support.',
          });
        },
      },
    );
  };

  const handleExited = () => {
    reset(DEFAULT_VALUES);
  };

  return (
    <Modal open={open} onClose={onClose} onExited={handleExited} title="Edit Project">
      <>
        <Content>
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Project name is required',
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <CpslInput
                placeholder="Enter Name"
                label="Project Name"
                onCpslInput={e => {
                  onChange(e.detail.value);
                }}
                onCpslBlur={onBlur}
                value={value}
                errorText={error?.message}
              />
            )}
          />
          <NameSubtitle variant="bodyXS" color="secondary" weight="medium">
            This name will be user facing
          </NameSubtitle>
          <Controller
            name="framework"
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
              return (
                <CpslSelect
                  placeholder="Select Framework"
                  onCpslSelectValueChange={(e: CpslSelectCustomEvent<string>) => {
                    onChange(e.detail as Framework);
                  }}
                  onCpslBlur={onBlur}
                  selectedValue={value}
                  showFormattedSelectedItem
                  errorText={error?.message}
                >
                  {value && (
                    <SelectItemContainer slot="selected-item">
                      <EnvText>{formatFrameworkName(value as Framework)}</EnvText>
                    </SelectItemContainer>
                  )}
                  {FRAMEWORK_OPTIONS.map(fw => (
                    <CpslSelectItem key={fw} slot="items" value={fw}>
                      <SelectItemContainer>
                        <EnvText>{formatFrameworkName(fw)}</EnvText>
                      </SelectItemContainer>
                    </CpslSelectItem>
                  ))}
                </CpslSelect>
              );
            }}
          />
          <Controller
            name="packageManager"
            control={control}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => {
              return (
                <CpslSelect
                  placeholder="Select Package Manager"
                  onCpslSelectValueChange={(e: CpslSelectCustomEvent<string>) => {
                    onChange(e.detail as PackageManager);
                  }}
                  onCpslBlur={onBlur}
                  selectedValue={value}
                  showFormattedSelectedItem
                  errorText={error?.message}
                >
                  {value && (
                    <SelectItemContainer slot="selected-item">
                      <EnvText>{formatPackageManagerName(value as PackageManager)}</EnvText>
                    </SelectItemContainer>
                  )}
                  {PACKAGE_MANAGER_OPTIONS.map(pm => (
                    <CpslSelectItem key={pm} slot="items" value={pm}>
                      <SelectItemContainer>
                        <EnvText>{formatPackageManagerName(pm)}</EnvText>
                      </SelectItemContainer>
                    </CpslSelectItem>
                  ))}
                </CpslSelect>
              );
            }}
          />
        </Content>
        <CpslButton disabled={!isValid} fullWidth onClick={handleSaveClick}>
          Save
        </CpslButton>
      </>
    </Modal>
  );
};

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SelectItemContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const EnvText = styled(CpslText)`
  text-transform: capitalize;
`;

const NameSubtitle = styled(CpslText)`
  margin-top: -4px;
`;
