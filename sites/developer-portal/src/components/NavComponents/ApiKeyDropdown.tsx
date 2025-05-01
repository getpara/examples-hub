import { useParams } from 'react-router-dom';
import { NavDropdown } from './NavDropdown';
import {
  useGetAllOrganizationKeys,
  useGetAvailableKeyEnvs,
  useGetOrganizationKey,
} from '../../hooks/api/queries/useOrganizationKeys';
import { Environment } from '../../types/environment';
import { NavSeparator } from './NavSeparator';
import { Button, DropdownMenuSeparator } from '@getpara/react-component-library';
import { SquareArrowUpRight } from 'lucide-react';
import { formatEnvName } from '../../utils/apiKey';
import { useState } from 'react';
import { CreateProductionKeyModal } from '../CreateProductionKeyModal/CreateProductionKeyModal';
import { IS_BETA, IS_PROD } from '../../utils/constants';

export const ApiKeyDropdown = () => {
  const { organizationId, projectId, apiKey, env, apiKeyPage } = useParams();
  const { data: apiKeyData } = useGetOrganizationKey(projectId ?? '', apiKey ?? '', env as Environment);
  const { data: apiKeys } = useGetAllOrganizationKeys(projectId ?? '');
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  if (!apiKeyData || !apiKeys?.length) {
    return null;
  }

  const availableKeyEnv = availableKeyEnvs?.find(
    env => env === (IS_PROD ? Environment.PROD : IS_BETA ? Environment.BETA : Environment.SANDBOX),
  );

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setIsNavOpen(false);
  };

  return (
    <>
      <NavSeparator />
      <NavDropdown
        selected={{
          id: apiKeyData.id,
          name: formatEnvName(apiKeyData.environment) ?? '',
          env: env as Environment,
          badge: apiKeyData?.archived ? 'Archived' : undefined,
        }}
        options={apiKeys.map(key => ({
          id: key.id,
          name: formatEnvName(key.environment) ?? '',
          env: key.environment,
          badge: key?.archived ? 'Archived' : undefined,
        }))}
        pathPrefix={`/${organizationId}/project/${projectId}/key/${env}/`}
        pathSuffix={apiKeyPage ? `/${apiKeyPage}` : '/setup'}
        isOpen={isNavOpen}
        setIsOpen={setIsNavOpen}
      >
        {!!availableKeyEnv && (
          <>
            <DropdownMenuSeparator />
            <div className="para:p-1">
              <Button size="sm" className="para:w-full" onClick={handleOpenModal}>
                <SquareArrowUpRight className="para:size-4" />
                {`Create ${formatEnvName(availableKeyEnv)} Instance`}
              </Button>
            </div>
          </>
        )}
      </NavDropdown>
      <CreateProductionKeyModal open={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
};
