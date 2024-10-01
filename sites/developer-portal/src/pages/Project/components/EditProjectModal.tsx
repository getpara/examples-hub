import { CpslButton, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { triggerToast } from '../../../utils/toasts';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { useUpdateProject } from '../../../hooks/api/mutations/useUpdateProject';
import { useParams } from 'react-router-dom';
import { useGetProject } from '../../../hooks/api/queries/useProjects';
import { formatFrameworkName, frameworkHasPackageManager } from '../../../utils/framework';
import { FRAMEWORK_OPTIONS, PACKAGE_MANAGER_OPTIONS } from '../../../utils/constants';
import { formatPackageManagerName } from '../../../utils/packageManager';
import { useGetSelectedOrganizationIsValid } from '../../../hooks/api/queries/useOrganizations';

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export const EditProjectModal = ({ open, onClose }: EditProjectModalProps) => {
  const { projectId } = useParams();
  const { data: project } = useGetProject(projectId ?? '');
  const { mutate: updateProject } = useUpdateProject();
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

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
    if (!projectId || !orgValid) {
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
                helperText="This name will be user facing"
              />
            )}
          />
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
                    <div slot="selected-item">
                      <CpslText>{formatFrameworkName(value as Framework)}</CpslText>
                    </div>
                  )}
                  {FRAMEWORK_OPTIONS.map(fw => (
                    <CpslSelectItem key={fw} slot="items" value={fw}>
                      <div>
                        <CpslText>{formatFrameworkName(fw)}</CpslText>
                      </div>
                    </CpslSelectItem>
                  ))}
                </CpslSelect>
              );
            }}
          />
          {frameworkHasPackageManager[(framework as Framework) ?? Framework.REACT] && (
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
                      <div slot="selected-item">
                        <CpslText>{formatPackageManagerName(value as PackageManager)}</CpslText>
                      </div>
                    )}
                    {PACKAGE_MANAGER_OPTIONS.map(pm => (
                      <CpslSelectItem key={pm} slot="items" value={pm}>
                        <div>
                          <CpslText>{formatPackageManagerName(pm)}</CpslText>
                        </div>
                      </CpslSelectItem>
                    ))}
                  </CpslSelect>
                );
              }}
            />
          )}
        </Content>
        <CpslButton disabled={!isValid || !orgValid} fullWidth onClick={handleSaveClick}>
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
