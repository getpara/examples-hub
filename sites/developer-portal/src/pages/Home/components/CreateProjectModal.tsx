import { CpslButton, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@getpara/react-components';
import styled from 'styled-components';
import { Modal } from '../../../components/Modal/Modal';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useCreateProject } from '../../../hooks/api/mutations/useCreateProject';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';
import { CpslSelectCustomEvent } from '@getpara/core-components';
import { ENV_VARS, FRAMEWORK_OPTIONS, IS_BETA, IS_PROD, PACKAGE_MANAGER_OPTIONS } from '../../../utils/constants';
import { formatFrameworkName, frameworkHasPackageManager } from '../../../utils/framework';
import { formatPackageManagerName } from '../../../utils/packageManager';
import { HTTPS_URL_REGEX } from '../../../utils/regex';
import { useCreateApiKey } from '../../../hooks/api/mutations/useCreateApiKey';
import { Environment } from '../../../types/environment';
import { useCanCreateProject } from '../../../hooks/subscriptionGating/useCanCreateProject';
import { AxiosError } from 'axios';
import { toast } from '@getpara/react-component-library';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
}

const DEFAULT_VALUES = {
  name: '',
  framework: '',
  packageManager: '',
  homepageUrl: '',
};

export const CreateProjectModal = ({ open, onClose }: CreateProjectModalProps) => {
  const { canCreateProject } = useCanCreateProject();
  const { mutateAsync: createProject } = useCreateProject();
  const { mutateAsync: createApiKey } = useCreateApiKey();

  const {
    control,
    formState: { isValid },
    reset,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const [name, framework, packageManager, homepageUrl] = useWatch({
    control,
    name: ['name', 'framework', 'packageManager', 'homepageUrl'],
  });

  const handleCreateClick = async () => {
    if (canCreateProject) {
      try {
        const newProject = await createProject(
          {
            data: { name, framework, packageManager },
          },
          {
            onError: err => {
              let body = 'Please try again. If the problem persists, contact Para support.';

              if ((err as AxiosError).response?.data === 'max projects created for the current plan') {
                body =
                  "You've reached the max number of projects allowed on your current plan level. Upgrade to add more projects.";
              }

              toast.error('Failed to Create Project', { description: body });
            },
          },
        );

        if (newProject) {
          await createApiKey(
            {
              projectId: newProject.project.id,
              env: IS_PROD ? Environment.BETA : IS_BETA ? Environment.SANDBOX : (ENV_VARS.environment as Environment),
              data: { homepageUrl },
            },
            {
              onError: () => {
                toast.error('Failed to Create Key', {
                  description: 'Please try again. If the problem persists, contact Para support.',
                });
              },
            },
          );
        }
        toast.success('Project Created!');
      } finally {
        onClose();
      }
    }
  };

  const handleExited = () => {
    reset(DEFAULT_VALUES);
  };

  if (!canCreateProject) {
    return null;
  }

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
          <Controller
            name="homepageUrl"
            control={control}
            rules={{
              required: 'Website URL is required',
              pattern: {
                value: HTTPS_URL_REGEX,
                message: 'Must be a secure (https) url',
              },
            }}
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <CpslInput
                label="Website URL"
                placeholder="https://www.yourwebsite.com"
                onCpslInput={e => {
                  onChange(e.detail.value);
                }}
                onCpslBlur={onBlur}
                value={value}
                errorText={error?.message}
              />
            )}
          />
        </Content>
        <CpslButton disabled={!isValid} fullWidth onClick={handleCreateClick}>
          Create
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
