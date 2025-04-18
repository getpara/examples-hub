import { CpslButton, CpslIcon } from '@getpara/react-components';
import styled from 'styled-components';
import { useCallback, useMemo, useState } from 'react';
import { Table, TableData } from '../../components/Table/Table';
import { EnvironmentCell } from './components/EnvironmentCell';
import { CreateKeyModal } from './components/CreateKeyModal';
import { useIsMobile } from '../../hooks/useIsMobile';
import { formatDate } from '../../utils/formatDate';
import { useNavigate, useParams } from 'react-router-dom';
import { MOBILE_SIZE } from '../../utils/constants';
import { useGetAllOrganizationKeys, useGetAvailableKeyEnvs } from '../../hooks/api/queries/useOrganizationKeys';
import { useGetProject } from '../../hooks/api/queries/useProjects';
import { triggerToast } from '../../utils/toasts';
import { Header } from './components/Header';
import { useGetSelectedOrganizationIsValid } from '../../hooks/api/queries/useOrganizations';

const PAGE_SIZE = 6;

export const Project = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isMobile = useIsMobile();
  const { data: apiKeys } = useGetAllOrganizationKeys(projectId ?? '');
  const { data: project, isLoading: isProjectLoading } = useGetProject(projectId ?? '');
  const { data: availableKeyEnvs } = useGetAvailableKeyEnvs(projectId ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const { data: orgValid } = useGetSelectedOrganizationIsValid();

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleViewClick = useCallback(
    (id: string, env: string) => () => {
      navigate(`key/${env}/${id}/setup`);
    },
    [navigate],
  );

  const formattedData: TableData[] = useMemo(() => {
    return (
      apiKeys?.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE).map(d => {
        return {
          key: d.id,
          data: [
            {
              key: 'environment',
              value: <EnvironmentCell environment={d.environment} archived={d.archived} />,
            },
            {
              key: 'createdAt',
              value: formatDate(d.createdAt),
            },
            {
              key: 'edit',
              value: (
                <CpslButton variant="secondary" size="small" onClick={handleViewClick(d.id, d.environment.toLowerCase())}>
                  View
                </CpslButton>
              ),
              fitWidth: true,
            },
          ],
        } as TableData;
      }) ?? []
    );
  }, [apiKeys, page, handleViewClick]);

  const handleCreateClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  if (!projectId) {
    navigate('/');
  }

  if (!isProjectLoading && !project) {
    navigate('/');
    triggerToast({
      variant: 'error',
      title: 'Failed to Load Project',
    });
    return null;
  }

  return (
    <Container>
      <Header />
      <Table
        page={page}
        title="API Keys"
        subtitle="Create a new key or edit an existing key."
        data={formattedData}
        totalPages={Math.ceil((apiKeys?.length ?? 0) / PAGE_SIZE)}
        onPageChange={handlePageChange}
        headers={[{ headerName: 'Environment' }, { headerName: 'Date Created', colSpan: 2 }]}
        ActionButton={
          <CpslButton
            onClick={handleCreateClick}
            size={isMobile ? 'small' : 'medium'}
            disabled={!availableKeyEnvs?.length || !orgValid}
          >
            <CpslIcon slot="start" icon="plus" />
            Create
          </CpslButton>
        }
        noContentTitle="No Keys Yet"
        noContentSubtitle="Get started using Para by creating a new Beta API Key"
        NoContentActionButton={
          <CpslButton onClick={handleCreateClick} disabled={!orgValid}>
            <CpslIcon slot="start" icon="plus" />
            Create API Key
          </CpslButton>
        }
      />
      {!!availableKeyEnvs?.length && <CreateKeyModal open={modalOpen} onClose={handleCloseModal} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  max-width: 1200px;

  @media (max-width: ${MOBILE_SIZE}px) {
    margin-top: -16px;
  }
`;
