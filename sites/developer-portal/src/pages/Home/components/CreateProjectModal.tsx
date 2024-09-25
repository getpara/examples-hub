import { CpslButton, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import styled from 'styled-components';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { triggerToast } from '../../../utils/toasts';
import { useCreateProject } from '../../../hooks/api/mutations/useCreateProject';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { FRAMEWORK_OPTIONS, PACKAGE_MANAGER_OPTIONS } from '../../../utils/constants';
import { formatFrameworkName, frameworkHasPackageManager } from '../../../utils/framework';
import { formatPackageManagerName } from '../../../utils/packageManager';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES = {
  name: '',
  framework: '',
  packageManager: '',
};

export const CreateProjectModal = ({ open, onClose }: CreateProjectModalProps) => {
  const { mutate: createProject } = useCreateProject();

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

  const handleCreateClick = () => {
    createProject(
      {
        data: { name, framework, packageManager },
      },
      {
        onSuccess: () => {
          onClose();
          triggerToast({
            variant: 'success',
            title: 'Project Created!',
          });
        },
        onError: () => {
          triggerToast({
            variant: 'error',
            title: 'Failed to Create Project',
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
    <Modal open={open} onClose={onClose} onExited={handleExited} title="New Project" subtitle="Give your new project a name">
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
        <CpslButton disabled={!isValid} fullWidth onClick={handleCreateClick}>
          Next
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

const NameSubtitle = styled(CpslText)`
  margin-top: -4px;
`;
