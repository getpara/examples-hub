import { useParams } from 'react-router-dom';
import { NavDropdown } from './NavDropdown';
import {
  useGetAllOrganizationKeys,
  useGetAvailableKeyEnv,
  useGetOrganizationKey,
} from '../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../types/environment';
import { NavSeparator } from './NavSeparator';
import { Button, DropdownMenuSeparator } from '@getpara/react-component-library';
import { SquareArrowUpRight } from 'lucide-react';
import { formatEnvName } from '../../utils/apiKey';
import { useState } from 'react';
import { useCopyToNewKey } from '../../hooks/useCopyToNewKey';
import { useIsValidProject } from '../../hooks/useIsValidOrgConfig';

export const ApiKeyDropdown = () => {
  const { organizationId, projectId, apiKey, env, apiKeyPage } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: apiKeys } = useGetAllOrganizationKeys(projectId ?? '');
  const { data: availableKeyEnv } = useGetAvailableKeyEnv(projectId ?? '');
  const { copyToNewKey, isCreatingKey } = useCopyToNewKey();
  const isValidProject = useIsValidProject(projectId, true);
  const [isNavOpen, setIsNavOpen] = useState(false);

  if (!apiKeyData || !apiKeys?.length) {
    return null;
  }

  const handleCreateClick = () => {
    copyToNewKey();
  };

  return (
    <>
      <NavSeparator />
      <NavDropdown
        selected={{
          id: `${apiKeyData.environment}/${apiKeyData.id}`,
          name: formatEnvName(apiKeyData.environment)
            ? `${formatEnvName(apiKeyData.environment)}${
                !!apiKeys.find(k => k.environment === apiKeyData.environment && k.id !== apiKeyData.id)
                  ? ` (${apiKeyData.apiKey.slice(-4)})`
                  : ''
              }`
            : '',
          env: env as Environment,
          badge: apiKeyData?.archived ? 'Archived' : undefined,
        }}
        options={apiKeys.map(key => ({
          id: `${key.environment}/${key.id}`,
          // If there are multiple keys available with the same env, append the last 4 of the key to distinguish them
          name: formatEnvName(key.environment)
            ? `${formatEnvName(key.environment)}${
                !!apiKeys.find(k => k.environment === key.environment && k.id !== key.id) ? ` (${key.apiKey.slice(-4)})` : ''
              }`
            : '',
          env: key.environment,
          badge: key?.archived ? 'Archived' : undefined,
        }))}
        pathPrefix={`/${organizationId}/project/${projectId}/key/`}
        pathSuffix={apiKeyPage ? `/${apiKeyPage}` : '/setup'}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      >
        {!!availableKeyEnv && isValidProject && (
          <>
            <DropdownMenuSeparator />
            <div className="para:p-1">
              <Button
                size="sm"
                className="para:w-full"
                onClick={handleCreateClick}
                disabled={isCreatingKey}
                isLoading={isCreatingKey}
              >
                <SquareArrowUpRight className="para:size-4" />
                {`Create ${formatEnvName(availableKeyEnv)} Instance`}
              </Button>
            </div>
          </>
        )}
      </NavDropdown>
    </>
  );
};
