import { CpslButton, CpslIcon, CpslInput, CpslSelect, CpslSelectItem, CpslText } from '@usecapsule/react-components';
import { CpslSelectCustomEvent } from '@usecapsule/core-components';
import { SplitCard, SplitCardInnerContainer } from '../../../components/SplitCard/SplitCard';
import { useParams } from 'react-router-dom';
import { ExternalLinkButton } from '../../../components/ExternalLinkButton/ExternalLinkButton';
import { FRAMEWORK_OPTIONS, PACKAGE_MANAGER_OPTIONS } from '../../../utils/constants';
import { InnerConfigurationCard } from './InnerConfigurationCard';
import { Framework } from '../../../types/framework';
import { PackageManager } from '../../../types/packageManager';
import {
  formatFrameworkName,
  frameworkHasPackageManager,
  getFrameworkDocsLink,
  getFrameworkPackages,
} from '../../../utils/framework';
import { formatPackageManagerName, getPackageManagerInstallString } from '../../../utils/packageManager';
import styled from 'styled-components';
import { useCopyToClipboard } from '../../../hooks/useCopyToClipboard';
import { useGetApiKeySetupStatus } from '../../../hooks/api/queries/useApiKeySetupStatus';
import { useUpdateApiKey } from '../../../hooks/api/mutations/useUpdateApiKey';
import { triggerToast } from '../../../utils/toasts';

interface InstallProjectCardProps {
  framework: Framework;
  packageManager: PackageManager;
  setFramework: (framework: Framework) => void;
  setPackageManager: (packageManager: PackageManager) => void;
}

export const InstallProjectCard = ({
  framework,
  packageManager,
  setFramework,
  setPackageManager,
}: InstallProjectCardProps) => {
  const { mutate: updateApiKey } = useUpdateApiKey();
  const { apiKey, env, projectId } = useParams();
  const { data: status } = useGetApiKeySetupStatus(projectId ?? '', apiKey ?? '', env ?? '');
  const [isCopied, copy] = useCopyToClipboard();

  // Step is complete if there is a user for the key or if isInstalled has been set
  const isComplete = !!status?.firstUser || status?.isInstalled;

  const installString = `${
    frameworkHasPackageManager[framework] ? `${getPackageManagerInstallString(packageManager)} ` : ''
  }${getFrameworkPackages(framework)}`;

  const handleFrameworkChange = (e: CpslSelectCustomEvent<string>) => {
    setFramework(e.detail as Framework);
  };

  const handlePackageManagerChange = (e: CpslSelectCustomEvent<string>) => {
    setPackageManager(e.detail as PackageManager);
  };

  const handleCopyInstallString = () => {
    copy(installString);
  };

  const handleCompleteClick = () => {
    if (projectId && apiKey && env) {
      updateApiKey(
        { projectId, keyId: apiKey, env, data: { isInstalled: true } },
        {
          onError: () => {
            triggerToast({
              variant: 'error',
              title: 'Failed to Save Step Completion',
              body: 'Please try again. If the problem persists, contact Capsule support.',
            });
          },
        },
      );
    }
  };

  return (
    <SplitCard
      LeftContent={
        <SplitCardInnerContainer>
          <CpslText variant="bodyL" weight="semiBold">
            Install Project
          </CpslText>
          <CpslText variant="bodyS" color="secondary">
            Choose your project settings.
          </CpslText>
          <ExternalLinkButton link={getFrameworkDocsLink(framework as Framework)} text="Install Guide" size="small" />
        </SplitCardInnerContainer>
      }
      RightContent={
        <SplitCardInnerContainer>
          <InnerConfigurationCard>
            <CpslSelect
              label="Framework"
              selectedValue={framework ?? ''}
              onCpslSelectValueChange={handleFrameworkChange}
              showFormattedSelectedItem
              placeholder="Choose framework"
            >
              {framework && (
                <div slot="selected-item">
                  <CpslText>{formatFrameworkName(framework as Framework)}</CpslText>
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
          </InnerConfigurationCard>
          {frameworkHasPackageManager[(framework as Framework) ?? Framework.REACT] && (
            <InnerConfigurationCard>
              <CpslSelect
                label="Package Manager"
                selectedValue={packageManager ?? ''}
                onCpslSelectValueChange={handlePackageManagerChange}
                showFormattedSelectedItem
                placeholder="Choose package manager"
              >
                {packageManager && (
                  <div slot="selected-item">
                    <CpslText>{formatPackageManagerName(packageManager as PackageManager)}</CpslText>
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
            </InnerConfigurationCard>
          )}
          <InnerConfigurationCard>
            <CodeInput label="Install Package" value={installString} disabled>
              {framework !== Framework.SWIFT && (
                <CpslButton slot="end" variant="ghost" onClick={handleCopyInstallString}>
                  <CopyIcon icon={isCopied ? 'check' : 'copy'} />
                </CpslButton>
              )}
            </CodeInput>
          </InnerConfigurationCard>
          <CompleteButton onClick={handleCompleteClick} variant="secondary" disabled={isComplete}>
            {isComplete ? (
              <>
                <CompleteIcon icon="check" />
                Completed
              </>
            ) : (
              'Complete Step'
            )}
          </CompleteButton>
        </SplitCardInnerContainer>
      }
    />
  );
};

const CodeInput = styled(CpslInput)`
  /* TODO: add css var to core components to pass font family to input */
  & input {
    --cpsl-font-family: 'IBM Plex Mono';
  }
  --input-font-size: 14px;
  --input-color: var(--cpsl-color-text-primary);
`;

const CopyIcon = styled(CpslIcon)`
  --icon-color: var(--cpsl-color-text-primary);
`;

const CompleteIcon = styled(CpslIcon)`
  --height: 20px;
  --width: 20px;
  --icon-color: unset;
`;

const CompleteButton = styled(CpslButton)`
  align-self: flex-end;
`;
